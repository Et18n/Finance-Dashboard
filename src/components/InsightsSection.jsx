import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactCurrency, formatCurrency } from "../utils/formatters";

function prettyMonth(monthKey) {
  if (!monthKey) {
    return "-";
  }

  const date = new Date(`${monthKey}-01T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMonthKey(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildMonthlySeries(transactions) {
  const monthly = transactions.reduce((acc, item) => {
    const key = getMonthKey(item.date);
    const current = acc[key] ?? { income: 0, expense: 0 };

    if (item.type === "income") {
      current.income += Number(item.amount);
    } else {
      current.expense += Number(item.amount);
    }

    acc[key] = current;
    return acc;
  }, {});

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, totals]) => ({
      key,
      label: prettyMonth(key),
      income: Number(totals.income.toFixed(2)),
      expense: Number(totals.expense.toFixed(2)),
    }));
}

function InsightsSection({ insights, transactions = [] }) {
  const topCategory = insights.highestSpendingCategory;
  const monthComparison = insights.monthComparison;
  const monthlySeries = useMemo(
    () => buildMonthlySeries(transactions).slice(-6),
    [transactions],
  );

  return (
    <section className="panel reveal insights-panel wide">
      <div className="panel-heading">
        <h3>Insights</h3>
        <p>
          Quick takeaways from the latest transaction data and monthly expense
          movement.
        </p>
      </div>

      <div className="insights-layout">
        <div className="insights-grid">
          <article>
            <h4>Highest spending category</h4>
            {topCategory ? (
              <p>
                <strong>{topCategory.name}</strong> at{" "}
                <strong>{formatCurrency(topCategory.value)}</strong>
              </p>
            ) : (
              <p>No expense data yet.</p>
            )}
          </article>

          <article>
            <h4>Monthly expense comparison</h4>
            {monthComparison ? (
              <p>
                {monthComparison.delta >= 0 ? "Up" : "Down"} by{" "}
                <strong>
                  {formatCurrency(Math.abs(monthComparison.delta))}
                </strong>{" "}
                ({Math.abs(monthComparison.percent).toFixed(1)}%) compared with{" "}
                {prettyMonth(monthComparison.previousMonthKey)}.
              </p>
            ) : (
              <p>Add data across multiple months to compare trends.</p>
            )}
            {monthComparison ? (
              <small>
                {prettyMonth(monthComparison.currentMonthKey)}:{" "}
                {formatCurrency(monthComparison.currentExpense)}
              </small>
            ) : null}
          </article>

          <article>
            <h4>Observed pattern</h4>
            <p>{insights.observation}</p>
            {"savingsRate" in insights ? (
              <small>
                Savings rate:{" "}
                <strong>{insights.savingsRate.toFixed(1)}%</strong>
              </small>
            ) : null}
          </article>
        </div>

        <div className="insights-chart-card">
          <h4>Monthly Cash Flow</h4>
          {monthlySeries.length ? (
            <div
              className="insights-chart"
              aria-label="Monthly cash flow chart"
            >
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={monthlySeries} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9cdb4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#5f6d69", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={compactCurrency}
                    tick={{ fill: "#5f6d69", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    cursor={false}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #d8ccb4",
                      background: "#fff8eb",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#1e9b78"
                    radius={[4, 4, 0, 0]}
                    activeBar={false}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#c46a4a"
                    radius={[4, 4, 0, 0]}
                    activeBar={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <p>Add transactions to visualize monthly income vs expense.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InsightsSection;
