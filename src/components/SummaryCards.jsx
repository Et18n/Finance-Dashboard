import { formatCurrency } from "../utils/formatters";

function SummaryCards({ summary }) {
  const cards = [
    {
      key: "balance",
      label: "Total Balance",
      value: summary.balance,
      tone: "neutral",
      helper: "Includes opening balance and current net flow",
    },
    {
      key: "income",
      label: "Income",
      value: summary.income,
      tone: "income",
      helper: "All income transactions",
    },
    {
      key: "expenses",
      label: "Expenses",
      value: summary.expenses,
      tone: "expense",
      helper: "All expense transactions",
    },
  ];

  return (
    <section className="summary-grid">
      {cards.map((card) => (
        <article key={card.key} className={`summary-card ${card.tone} reveal`}>
          <p>{card.label}</p>
          <h2>{formatCurrency(card.value)}</h2>
          <span>{card.helper}</span>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
