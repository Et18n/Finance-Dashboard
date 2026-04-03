import { formatCurrency } from "../utils/formatters";

function SummaryCards({ summary, canManage = false, onEditOpeningBalance }) {
  const cards = [
    {
      key: "balance",
      label: "Total Balance",
      value: summary.balance,
      tone: "neutral",
      helper: "Includes your saved base balance and current net flow.",
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
          <div className="summary-card-head">
            <p>{card.label}</p>
            {card.key === "balance" && canManage && onEditOpeningBalance ? (
              <button
                type="button"
                className="summary-edit-btn"
                onClick={onEditOpeningBalance}
              >
                Edit balance
              </button>
            ) : null}
          </div>
          <h2>{formatCurrency(card.value)}</h2>
          <span>{card.helper}</span>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
