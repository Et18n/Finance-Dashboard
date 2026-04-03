import { formatMonth } from "./formatters";

export function getFinancialSummary(transactions, balanceAmount) {
  const totals = transactions.reduce(
    (acc, item) => {
      if (item.type === "income") {
        acc.income += Number(item.amount);
      } else {
        acc.expenses += Number(item.amount);
      }
      return acc;
    },
    { income: 0, expenses: 0 },
  );

  const net = totals.income - totals.expenses;
  const normalizedBalance = Number.isFinite(Number(balanceAmount))
    ? Number(balanceAmount)
    : 0;

  return {
    income: totals.income,
    expenses: totals.expenses,
    net,
    balance: normalizedBalance + net,
  };
}

export function getBalanceTrend(transactions, balanceAmount) {
  if (!transactions.length) {
    return [];
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  const normalizedBalance = Number.isFinite(Number(balanceAmount))
    ? Number(balanceAmount)
    : 0;

  let runningBalance = normalizedBalance;

  return sorted.map((item) => {
    runningBalance +=
      item.type === "income" ? Number(item.amount) : -Number(item.amount);

    return {
      date: item.date,
      label: formatMonth(item.date),
      balance: Number(runningBalance.toFixed(2)),
    };
  });
}

export function getExpenseBreakdown(transactions) {
  const buckets = {};

  for (const item of transactions) {
    if (item.type !== "expense") {
      continue;
    }

    buckets[item.category] =
      (buckets[item.category] ?? 0) + Number(item.amount);
  }

  return Object.entries(buckets)
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);
}

function getMonthKey(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getInsights(transactions) {
  if (!transactions.length) {
    return {
      highestSpendingCategory: null,
      monthComparison: null,
      observation: "Add transactions to unlock insights.",
    };
  }

  const expensesByCategory = getExpenseBreakdown(transactions);
  const highestSpendingCategory = expensesByCategory[0] ?? null;

  const monthlyTotals = transactions.reduce((acc, item) => {
    const key = getMonthKey(item.date);
    const entry = acc[key] ?? { income: 0, expense: 0 };

    if (item.type === "income") {
      entry.income += Number(item.amount);
    } else {
      entry.expense += Number(item.amount);
    }

    acc[key] = entry;
    return acc;
  }, {});

  const orderedMonths = Object.keys(monthlyTotals).sort();
  const currentMonthKey = orderedMonths[orderedMonths.length - 1];
  const previousMonthKey = orderedMonths[orderedMonths.length - 2];

  let monthComparison = null;
  if (currentMonthKey && previousMonthKey) {
    const currentExpense = monthlyTotals[currentMonthKey].expense;
    const previousExpense = monthlyTotals[previousMonthKey].expense;
    const delta = currentExpense - previousExpense;
    const base = previousExpense || 1;

    monthComparison = {
      currentMonthKey,
      previousMonthKey,
      currentExpense,
      previousExpense,
      delta,
      percent: (delta / base) * 100,
    };
  }

  const summary = getFinancialSummary(transactions, 0);
  const savingsRate = summary.income ? (summary.net / summary.income) * 100 : 0;

  const observation =
    savingsRate >= 35
      ? "Savings rate is strong. Current spending pace supports healthy cash growth."
      : "Spending is rising faster than income. Review top categories to improve margin.";

  return {
    highestSpendingCategory,
    monthComparison,
    observation,
    savingsRate,
  };
}
