import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import InsightsSection from "./components/InsightsSection";
import SpendingBreakdownChart from "./components/SpendingBreakdownChart";
import SummaryCards from "./components/SummaryCards";
import TransactionEditorModal from "./components/TransactionEditorModal";
import TransactionsSection from "./components/TransactionsSection";
import TrendChart from "./components/TrendChart";
import { useFinance } from "./context/useFinance";
import { openingBalance } from "./data/transactions";
import {
  exportTransactionsAsCsv,
  exportTransactionsAsJson,
} from "./utils/exporters";
import {
  getBalanceTrend,
  getExpenseBreakdown,
  getFinancialSummary,
  getInsights,
} from "./utils/analytics";
import "./App.css";

const THEME_STORAGE_KEY = "finance-dashboard-theme";

function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "dark" ? "dark" : "light";
}

const commonCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Housing",
  "Groceries",
  "Utilities",
  "Transport",
  "Dining",
  "Entertainment",
  "Health",
  "Shopping",
];

function App() {
  const {
    role,
    transactions,
    filteredTransactions,
    filters,
    searchTerm,
    sortBy,
    groupBy,
    isLoading,
    isSyncing,
    apiError,
    availableCategories,
    setRole,
    setFilters,
    setSearchTerm,
    setSortBy,
    setGroupBy,
    resetFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
  } = useFinance();
  const [theme, setTheme] = useState(getInitialTheme);
  const [editorState, setEditorState] = useState({
    open: false,
    mode: "add",
    transaction: null,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const summary = useMemo(
    () => getFinancialSummary(transactions, openingBalance),
    [transactions],
  );
  const trendData = useMemo(
    () => getBalanceTrend(transactions, openingBalance),
    [transactions],
  );
  const expenseBreakdown = useMemo(
    () => getExpenseBreakdown(transactions),
    [transactions],
  );
  const insights = useMemo(() => getInsights(transactions), [transactions]);
  const transactionsViewKey = useMemo(
    () =>
      [
        searchTerm,
        sortBy,
        groupBy,
        filters.type,
        filters.category,
        filters.dateFrom,
        filters.dateTo,
        filters.minAmount,
        filters.maxAmount,
      ].join("|"),
    [searchTerm, sortBy, groupBy, filters],
  );

  const canManage = role === "admin";

  const editorCategories = useMemo(() => {
    const merged = new Set([...commonCategories, ...availableCategories]);
    return [...merged].sort((a, b) => a.localeCompare(b));
  }, [availableCategories]);

  function closeEditor() {
    setEditorState((current) => ({ ...current, open: false }));
  }

  function openAddEditor() {
    if (!canManage) {
      return;
    }

    setEditorState({ open: true, mode: "add", transaction: null });
  }

  function openEditEditor(transaction) {
    if (!canManage) {
      return;
    }

    setEditorState({ open: true, mode: "edit", transaction });
  }

  function handleRoleChange(nextRole) {
    setRole(nextRole);
    if (nextRole !== "admin") {
      closeEditor();
    }
  }

  function handleSaveTransaction(payload) {
    if (editorState.mode === "edit" && payload.id) {
      updateTransaction(payload);
      return;
    }

    addTransaction({
      ...payload,
      id: `tx-${Date.now()}`,
    });
  }

  function handleThemeToggle() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  function handleDeleteTransaction(transactionId) {
    deleteTransaction(transactionId);
  }

  function handleDeleteAllTransactions() {
    deleteAllTransactions();
  }

  function handleExportCsv() {
    if (!filteredTransactions.length) {
      return;
    }

    exportTransactionsAsCsv(filteredTransactions);
  }

  function handleExportJson() {
    if (!filteredTransactions.length) {
      return;
    }

    exportTransactionsAsJson(filteredTransactions);
  }

  return (
    <main className="dashboard-shell">
      <DashboardHeader
        role={role}
        onRoleChange={handleRoleChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      {isLoading ? (
        <p className="status-banner info">
          Loading transactions from Mock API...
        </p>
      ) : null}

      {!isLoading && isSyncing ? (
        <p className="status-banner sync">Syncing local changes...</p>
      ) : null}

      {apiError ? <p className="status-banner error">{apiError}</p> : null}

      <SummaryCards summary={summary} />

      <section className="visual-grid">
        <TrendChart data={trendData} />
        <SpendingBreakdownChart data={expenseBreakdown} />
      </section>

      <section className="lower-grid single">
        <TransactionsSection
          key={transactionsViewKey}
          transactions={filteredTransactions}
          categories={availableCategories}
          filters={filters}
          searchTerm={searchTerm}
          sortBy={sortBy}
          groupBy={groupBy}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilters}
          onSortChange={setSortBy}
          onGroupByChange={setGroupBy}
          onResetFilters={resetFilters}
          onAdd={openAddEditor}
          onEdit={openEditEditor}
          onDelete={handleDeleteTransaction}
          onDeleteAll={handleDeleteAllTransactions}
          onExportCsv={handleExportCsv}
          onExportJson={handleExportJson}
          canManage={canManage}
        />
      </section>

      <InsightsSection insights={insights} transactions={transactions} />

      {editorState.open ? (
        <TransactionEditorModal
          mode={editorState.mode}
          transaction={editorState.transaction}
          categories={editorCategories}
          onClose={closeEditor}
          onSave={handleSaveTransaction}
        />
      ) : null}

      <button
        type="button"
        className="theme-fab"
        onClick={handleThemeToggle}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        <span className="theme-fab-icon" aria-hidden="true">
          {theme === "dark" ? (
            <svg
              className="sun-icon"
              viewBox="0 0 24 24"
              focusable="false"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4.6" />
              <path d="M12 2.5v2.3M12 19.2v2.3M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6" />
            </svg>
          ) : (
            <svg
              className="moon-icon"
              viewBox="0 0 24 24"
              focusable="false"
              aria-hidden="true"
            >
              <path d="M14.2 2.4a9.8 9.8 0 1 0 7.4 14.8 9.3 9.3 0 0 1-5.8 1.9 9.5 9.5 0 0 1-9.5-9.5 9.3 9.3 0 0 1 7.9-9.2Z" />
            </svg>
          )}
        </span>
      </button>
    </main>
  );
}

export default App;
