import { Fragment, useEffect, useMemo, useState } from "react";
import {
  compactCurrency,
  formatCurrency,
  formatDate,
} from "../utils/formatters";

const PAGE_SIZE = 7;
const FILTER_DEBOUNCE_MS = 1000;
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

function groupBySelection(transactions, groupBy) {
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
    const key =
      groupBy === "month"
        ? new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
          }).format(new Date(item.date))
        : item.category;

    if (!acc[key]) {
      acc[key] = {
        id: `${groupBy}-${key}`,
        label: key,
        items: [],
      };
    }

    acc[key].items.push(item);
    return acc;
  }, {});

  const grouped = Object.values(groupedMap);

  if (groupBy === "month") {
    grouped.sort(
      (a, b) =>
        new Date(b.items[0]?.date ?? 0) - new Date(a.items[0]?.date ?? 0),
    );
  } else {
    grouped.sort((a, b) => a.label.localeCompare(b.label));
  }

  return grouped;
}

function TransactionsSection({
  transactions,
  categories,
  filters,
  searchTerm,
  sortBy,
  groupBy,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onGroupByChange,
  onResetFilters,
  onAdd,
  onEdit,
  onDelete,
  onDeleteAll,
  onExportCsv,
  onExportJson,
  canManage,
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState(searchTerm);
  const [draftFilters, setDraftFilters] = useState(() => ({ ...filters }));

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (effectivePage - 1) * PAGE_SIZE;
  const paginatedTransactions = transactions.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );

  const groupedTransactions = useMemo(
    () => groupBySelection(paginatedTransactions, groupBy),
    [paginatedTransactions, groupBy],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (draftSearch.trim().length > 0) {
      count += 1;
    }

    if (sortBy !== DEFAULT_SORT_BY) {
      count += 1;
    }

    if (groupBy !== DEFAULT_GROUP_BY) {
      count += 1;
    }

    Object.keys(DEFAULT_FILTERS).forEach((key) => {
      if (
        String(draftFilters[key] ?? "") !== String(DEFAULT_FILTERS[key] ?? "")
      ) {
        count += 1;
      }
    });

    return count;
  }, [draftFilters, draftSearch, sortBy, groupBy]);

  const hasActiveFilters = activeFilterCount > 0;

  const hasPendingSearch = draftSearch !== searchTerm;
  const hasPendingFilterChanges = useMemo(
    () =>
      Object.keys(filters).some(
        (key) => String(draftFilters[key] ?? "") !== String(filters[key] ?? ""),
      ),
    [draftFilters, filters],
  );

  useEffect(() => {
    if (!hasPendingSearch) {
      return;
    }

    const timerId = window.setTimeout(() => {
      onSearchChange(draftSearch);
    }, FILTER_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [draftSearch, hasPendingSearch, onSearchChange]);

  useEffect(() => {
    if (!hasPendingFilterChanges) {
      return;
    }

    const timerId = window.setTimeout(() => {
      onFilterChange(draftFilters);
    }, FILTER_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [draftFilters, hasPendingFilterChanges, onFilterChange]);

  function updateDraftFilter(field, value) {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getDisplayAmount(amount) {
    if (Math.abs(amount) >= 1000000) {
      return compactCurrency(amount);
    }

    return formatCurrency(amount);
  }

  function handleDelete(item) {
    if (!canManage) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete transaction "${item.description}"?`,
    );

    if (shouldDelete) {
      onDelete(item.id);
    }
  }

  function handleResetAllFilters() {
    setDraftSearch("");
    setDraftFilters(DEFAULT_FILTERS);
    setShowAdvancedFilters(false);
    setCurrentPage(1);
    onResetFilters();
  }

  function handleDeleteAllTransactions() {
    if (!canManage || !transactions.length) {
      return;
    }

    const shouldDeleteAll = window.confirm(
      `Delete all ${transactions.length} transactions? This action cannot be undone.`,
    );

    if (shouldDeleteAll) {
      onDeleteAll();
      setCurrentPage(1);
    }
  }

  return (
    <section className="panel reveal transactions-panel">
      <div className="panel-heading between">
        <div>
          <h3>Transactions</h3>
          <p>Search, filter, and inspect transaction details.</p>
        </div>

        <div className="panel-actions">
          <div className="export-actions">
            <button
              type="button"
              className="table-btn"
              onClick={onExportCsv}
              disabled={!transactions.length}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="table-btn"
              onClick={onExportJson}
              disabled={!transactions.length}
            >
              Export JSON
            </button>
          </div>

          {canManage ? (
            <div className="admin-actions">
              <button type="button" className="primary-btn" onClick={onAdd}>
                Add Transaction
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={handleDeleteAllTransactions}
                disabled={!transactions.length}
              >
                Delete All
              </button>
            </div>
          ) : (
            <p className="badge-note">Viewer mode: edit disabled</p>
          )}
        </div>
      </div>

      <div
        className="filter-stack"
        role="group"
        aria-label="Transaction filters"
      >
        <div className="filter-grid compact">
          <label className="search-col">
            Search
            <input
              type="text"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Description, amount, category"
            />
          </label>

          <label>
            Type
            <select
              value={draftFilters.type}
              onChange={(event) =>
                updateDraftFilter("type", event.target.value)
              }
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expenditure</option>
            </select>
          </label>

          <label>
            Category
            <select
              value={draftFilters.category}
              onChange={(event) =>
                updateDraftFilter("category", event.target.value)
              }
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Amount: high to low</option>
              <option value="amount-asc">Amount: low to high</option>
              <option value="category-asc">Category A-Z</option>
            </select>
          </label>

          <div className="filter-actions">
            <button
              type="button"
              className="table-btn filter-toggle"
              onClick={() => setShowAdvancedFilters((current) => !current)}
            >
              {showAdvancedFilters ? "Hide More Filters" : "More Filters"}
            </button>
            {hasActiveFilters ? (
              <span className="active-filter-chip" aria-live="polite">
                {activeFilterCount} active
              </span>
            ) : null}
            <button
              type="button"
              className="ghost-btn reset-inline-btn"
              onClick={handleResetAllFilters}
              disabled={!hasActiveFilters}
            >
              Reset
            </button>
          </div>
        </div>

        {showAdvancedFilters ? (
          <div className="filter-grid advanced">
            <label>
              Date From
              <input
                type="date"
                value={draftFilters.dateFrom}
                onChange={(event) =>
                  updateDraftFilter("dateFrom", event.target.value)
                }
              />
            </label>

            <label>
              Date To
              <input
                type="date"
                value={draftFilters.dateTo}
                onChange={(event) =>
                  updateDraftFilter("dateTo", event.target.value)
                }
              />
            </label>

            <label>
              Min Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftFilters.minAmount}
                placeholder="0"
                onChange={(event) =>
                  updateDraftFilter("minAmount", event.target.value)
                }
              />
            </label>

            <label>
              Max Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftFilters.maxAmount}
                placeholder="5000"
                onChange={(event) =>
                  updateDraftFilter("maxAmount", event.target.value)
                }
              />
            </label>

            <label>
              Group By
              <select
                value={groupBy}
                onChange={(event) => onGroupByChange(event.target.value)}
              >
                <option value="none">None</option>
                <option value="category">Category</option>
                <option value="month">Month</option>
              </select>
            </label>
          </div>
        ) : null}

        <p className="table-meta">
          Showing {transactions.length ? pageStartIndex + 1 : 0}-
          {Math.min(pageStartIndex + PAGE_SIZE, transactions.length)} of{" "}
          {transactions.length} transactions
        </p>
      </div>

      {!transactions.length ? (
        <div className="empty-state table-empty">
          <p>No transactions match your filters.</p>
          <button
            type="button"
            className="ghost-btn"
            onClick={handleResetAllFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="date-col">Date</th>
                <th className="description-col">Description</th>
                <th className="category-col">Category</th>
                <th className="type-col">Type</th>
                <th className="right amount-col">Amount</th>
                <th className="action-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedTransactions.map((group) => (
                <Fragment key={group.id}>
                  {groupBy !== "none" ? (
                    <tr className="group-row">
                      <td colSpan={6}>
                        <strong>{group.label}</strong> ({group.items.length})
                      </td>
                    </tr>
                  ) : null}

                  {group.items.map((item) => (
                    <tr key={item.id}>
                      <td className="date-cell">{formatDate(item.date)}</td>
                      <td className="description-cell">{item.description}</td>
                      <td className="category-cell">{item.category}</td>
                      <td className="type-cell">
                        <span className={`pill ${item.type}`}>
                          {item.type === "expense" ? "Expenditure" : "Income"}
                        </span>
                      </td>
                      <td
                        className={`right amount amount-cell ${item.type}`}
                        title={formatCurrency(item.amount)}
                      >
                        {item.type === "expense" ? "-" : "+"}
                        {getDisplayAmount(item.amount)}
                      </td>
                      <td className="action-cell">
                        {canManage ? (
                          <div className="action-actions">
                            <button
                              type="button"
                              className="table-btn action-btn"
                              onClick={() => onEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="danger-btn action-btn"
                              onClick={() => handleDelete(item)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="muted">Read only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>

          <div className="pagination-row">
            <button
              type="button"
              className="table-btn"
              onClick={() => setCurrentPage(Math.max(1, effectivePage - 1))}
              disabled={effectivePage === 1}
            >
              Previous
            </button>

            <span className="page-indicator">
              Page {effectivePage} of {totalPages}
            </span>

            <button
              type="button"
              className="table-btn"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, effectivePage + 1))
              }
              disabled={effectivePage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default TransactionsSection;
