import { initialTransactions } from "../data/transactions";

const STORAGE_KEY = "finance-dashboard-transactions";
const FETCH_DELAY_MS = 450;
const SAVE_DELAY_MS = 250;

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function parseStoredTransactions(rawValue) {
  if (!rawValue) {
    return initialTransactions;
  }

  const parsed = JSON.parse(rawValue);
  return Array.isArray(parsed) ? parsed : initialTransactions;
}

export async function fetchTransactions() {
  await delay(FETCH_DELAY_MS);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return parseStoredTransactions(raw);
  } catch {
    throw new Error("Mock API failed to fetch transactions.");
  }
}

export async function saveTransactions(transactions) {
  await delay(SAVE_DELAY_MS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return {
      ok: true,
      count: transactions.length,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    throw new Error("Mock API failed to save transactions.");
  }
}
