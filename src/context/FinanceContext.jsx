import { useEffect, useMemo, useReducer, useState } from "react";
import {
  fetchTransactions,
  saveTransactions,
} from "../services/mockFinanceApi";
import { openingBalance as seedOpeningBalance } from "../data/transactions";
import FinanceContext from "./financeContextInstance";

const ROLE_STORAGE_KEY = "finance-dashboard-role";
const OPENING_BALANCE_STORAGE_KEY = "finance-dashboard-opening-balance";
const DEFAULT_ROLE = "viewer";
const DEFAULT_SORT_BY = "date-desc";
const DEFAULT_GROUP_BY = "none";
const DEFAULT_FILTERS = {
  type: "all",
  category: "all",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
};

function getStoredRole() {
  if (typeof window === "undefined") {
    return DEFAULT_ROLE;
  }

  try {
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    return storedRole === "admin" || storedRole === "viewer"
      ? storedRole
      : DEFAULT_ROLE;
  } catch {
    return DEFAULT_ROLE;
  }
}

function getStoredOpeningBalance() {
  if (typeof window === "undefined") {
    return seedOpeningBalance;
  }

  try {
    const storedOpeningBalance = localStorage.getItem(
      OPENING_BALANCE_STORAGE_KEY,
    );

    if (storedOpeningBalance === null) {
      return seedOpeningBalance;
    }

    const parsed = Number(storedOpeningBalance);
    return Number.isFinite(parsed) ? parsed : seedOpeningBalance;
  } catch {
    return seedOpeningBalance;
  }
}

function getInitialState() {
  return {
    role: getStoredRole(),
    openingBalance: getStoredOpeningBalance(),
    transactions: [],
    filters: { ...DEFAULT_FILTERS },
    searchTerm: "",
    sortBy: DEFAULT_SORT_BY,
    groupBy: DEFAULT_GROUP_BY,
  };
}

function sortTransactions(transactions, sortBy) {
  const sorted = [...transactions];

  switch (sortBy) {
    case "date-asc":
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "amount-desc":
      sorted.sort((a, b) => b.amount - a.amount);
      break;
    case "amount-asc":
      sorted.sort((a, b) => a.amount - b.amount);
      break;
    case "category-asc":
      sorted.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case "date-desc":
    default:
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
  }

  return sorted;
}

function filterTransactions(transactions, filters, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const minAmount =
    filters.minAmount === "" || Number.isNaN(Number(filters.minAmount))
      ? null
      : Number(filters.minAmount);
  const maxAmount =
    filters.maxAmount === "" || Number.isNaN(Number(filters.maxAmount))
      ? null
      : Number(filters.maxAmount);

  return transactions.filter((item) => {
    const typeMatch = filters.type === "all" || item.type === filters.type;
    const categoryMatch =
      filters.category === "all" || item.category === filters.category;
    const dateFromMatch = !filters.dateFrom || item.date >= filters.dateFrom;
    const dateToMatch = !filters.dateTo || item.date <= filters.dateTo;
    const minAmountMatch =
      minAmount === null || Number(item.amount) >= minAmount;
    const maxAmountMatch =
      maxAmount === null || Number(item.amount) <= maxAmount;

    const searchMatch =
      !normalizedSearch ||
      item.description.toLowerCase().includes(normalizedSearch) ||
      item.category.toLowerCase().includes(normalizedSearch) ||
      item.type.toLowerCase().includes(normalizedSearch) ||
      String(item.amount).includes(normalizedSearch) ||
      item.date.includes(normalizedSearch);

    return (
      typeMatch &&
      categoryMatch &&
      dateFromMatch &&
      dateToMatch &&
      minAmountMatch &&
      maxAmountMatch &&
      searchMatch
    );
  });
}

function monthLabel(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function groupTransactions(transactions, groupBy) {
  if (groupBy === "none") {
    return [
      {
        id: "group-all",
        label: "All Transactions",
        items: transactions,
      },
    ];
  }

  const groupedMap = transactions.reduce((acc, item) => {
    const key = groupBy === "month" ? monthLabel(item.date) : item.category;

    if (!acc[key]) {
      acc[key] = {
        id: `${groupBy}-${key}`,
        label: key,
        sortKey: item.date,
        items: [],
      };
    }

    acc[key].items.push(item);
    return acc;
  }, {});

  const groups = Object.values(groupedMap).map((group) => ({
    ...group,
    items: sortTransactions(group.items, "date-desc"),
  }));

  if (groupBy === "month") {
    groups.sort((a, b) => new Date(b.sortKey) - new Date(a.sortKey));
  } else {
    groups.sort((a, b) => a.label.localeCompare(b.label));
  }

  return groups;
}

function financeReducer(state, action) {
  switch (action.type) {
    case "BOOTSTRAP_TRANSACTIONS":
      return {
        ...state,
        transactions: action.payload,
      };
    case "SET_ROLE":
      return {
        ...state,
        role: action.payload,
      };
    case "SET_OPENING_BALANCE":
      return {
        ...state,
        openingBalance: action.payload,
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case "SET_SEARCH_TERM":
      return {
        ...state,
        searchTerm: action.payload,
      };
    case "SET_SORT_BY":
      return {
        ...state,
        sortBy: action.payload,
      };
    case "SET_GROUP_BY":
      return {
        ...state,
        groupBy: action.payload,
      };
    case "RESET_FILTERS":
      return {
        ...state,
        filters: { ...DEFAULT_FILTERS },
        searchTerm: "",
        sortBy: DEFAULT_SORT_BY,
        groupBy: DEFAULT_GROUP_BY,
      };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter(
          (item) => item.id !== action.payload,
        ),
      };
    case "DELETE_ALL_TRANSACTIONS":
      return {
        ...state,
        transactions: [],
      };
    default:
      return state;
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(
    financeReducer,
    undefined,
    getInitialState,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(ROLE_STORAGE_KEY, state.role);
    } catch {
      // Ignore storage write failures to keep UI usable.
    }
  }, [state.role]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        OPENING_BALANCE_STORAGE_KEY,
        String(state.openingBalance),
      );
    } catch {
      // Ignore storage write failures to keep UI usable.
    }
  }, [state.openingBalance]);

  useEffect(() => {
    let isActive = true;

    async function loadTransactions() {
      setIsLoading(true);

      try {
        const data = await fetchTransactions();
        if (!isActive) {
          return;
        }

        dispatch({
          type: "BOOTSTRAP_TRANSACTIONS",
          payload: data,
        });
        setApiError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to load transactions from mock API.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
          setIsBootstrapped(true);
        }
      }
    }

    loadTransactions();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }

    let isActive = true;

    async function syncTransactions() {
      setIsSyncing(true);

      try {
        await saveTransactions(state.transactions);
        if (isActive) {
          setApiError("");
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to sync transactions to mock API.",
        );
      } finally {
        if (isActive) {
          setIsSyncing(false);
        }
      }
    }

    syncTransactions();

    return () => {
      isActive = false;
    };
  }, [state.transactions, isBootstrapped]);

  const availableCategories = useMemo(() => {
    const categorySet = new Set(
      state.transactions.map((item) => item.category),
    );
    return [...categorySet].sort((a, b) => a.localeCompare(b));
  }, [state.transactions]);

  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactions(
      state.transactions,
      state.filters,
      state.searchTerm,
    );
    return sortTransactions(filtered, state.sortBy);
  }, [state.transactions, state.filters, state.searchTerm, state.sortBy]);

  const groupedTransactions = useMemo(
    () => groupTransactions(filteredTransactions, state.groupBy),
    [filteredTransactions, state.groupBy],
  );

  const value = useMemo(
    () => ({
      role: state.role,
      openingBalance: state.openingBalance,
      transactions: state.transactions,
      filteredTransactions,
      groupedTransactions,
      filters: state.filters,
      searchTerm: state.searchTerm,
      sortBy: state.sortBy,
      groupBy: state.groupBy,
      isLoading,
      isSyncing,
      apiError,
      availableCategories,
      setRole: (role) => dispatch({ type: "SET_ROLE", payload: role }),
      setOpeningBalance: (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
          return;
        }

        dispatch({
          type: "SET_OPENING_BALANCE",
          payload: Number(parsed.toFixed(2)),
        });
      },
      setFilters: (payload) => dispatch({ type: "SET_FILTERS", payload }),
      setSearchTerm: (value) =>
        dispatch({ type: "SET_SEARCH_TERM", payload: value }),
      setSortBy: (value) => dispatch({ type: "SET_SORT_BY", payload: value }),
      setGroupBy: (value) => dispatch({ type: "SET_GROUP_BY", payload: value }),
      resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
      addTransaction: (payload) =>
        dispatch({ type: "ADD_TRANSACTION", payload }),
      updateTransaction: (payload) =>
        dispatch({ type: "UPDATE_TRANSACTION", payload }),
      deleteTransaction: (id) =>
        dispatch({ type: "DELETE_TRANSACTION", payload: id }),
      deleteAllTransactions: () =>
        dispatch({ type: "DELETE_ALL_TRANSACTIONS" }),
    }),
    [
      state,
      availableCategories,
      filteredTransactions,
      groupedTransactions,
      isLoading,
      isSyncing,
      apiError,
    ],
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}
