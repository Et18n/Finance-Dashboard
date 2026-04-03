import { useState } from "react";
import { formatCurrency } from "../utils/formatters";

function BalanceEditorModal({ value, onClose, onSave }) {
  const [amount, setAmount] = useState(() => String(value));
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!amount.trim()) {
      setErrorMessage("Please enter a balance amount.");
      return;
    }

    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) {
      setErrorMessage("Please enter a valid balance amount.");
      return;
    }

    onSave(Number(parsed.toFixed(2)));
  }

  function handleAmountChange(nextValue) {
    setAmount(nextValue);
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h3>Update balance</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <p className="muted">Current balance: {formatCurrency(value)}</p>

          <label>
            Balance amount
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(event) => handleAmountChange(event.target.value)}
              autoFocus
              required
            />
          </label>

          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

          <div className="actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BalanceEditorModal;
