function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function exportTransactionsAsCsv(transactions) {
  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.map((item) => [
    item.date,
    item.description,
    item.category,
    item.type,
    item.amount,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  downloadFile("transactions-export.csv", csv, "text/csv;charset=utf-8;");
}

export function exportTransactionsAsJson(transactions) {
  downloadFile(
    "transactions-export.json",
    JSON.stringify(transactions, null, 2),
    "application/json;charset=utf-8;",
  );
}
