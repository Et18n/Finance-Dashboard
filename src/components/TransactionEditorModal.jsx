import { useState } from "react";
import { defaultFormState } from "../data/transactions";

function getInitialForm(mode, transaction) {
  if (mode === "edit" && transaction) {
    return {
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: String(transaction.amount),
    };
  }

  return defaultFormState;
}

function TransactionEditorModal({
  mode,
  transaction,
  categories,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() => getInitialForm(mode, transaction));
  const [errorMessage, setErrorMessage] = useState("");

  const modalTitle = mode === "edit" ? "Edit transaction" : "Add transaction";

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);
    if (
      !form.date ||
      !form.description.trim() ||
      !form.category ||
      amount <= 0
    ) {
      setErrorMessage(
        "Please complete all fields and enter an amount greater than zero.",
      );
      return;
    }

    onSave({
      ...transaction,
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      type: form.type,
      amount,
    });

    onClose();
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h3>{modalTitle}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              required
            />
          </label>

          <label>
            Description
            <input
              type="text"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="What was this transaction for?"
              required
            />
          </label>

          <div className="two-col">
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Type
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
          </div>

          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              required
            />
          </label>

          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

          <div className="actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {mode === "edit" ? "Save changes" : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionEditorModal;
