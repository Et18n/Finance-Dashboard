function DashboardHeader({ role, onRoleChange }) {
  return (
    <header className="dashboard-header reveal">
      <div>
        <p className="eyebrow">Personal Finance Dashboard</p>
        <h1>Ledger Bloom</h1>
        <p className="subtitle">
          A focused snapshot of cash flow, spending behavior, and transaction
          activity.
        </p>
      </div>

      <div className="header-controls">
        <div className="role-switcher" aria-label="Role selector">
          <span className="role-label">Role</span>
          <div className="role-toggle" role="group" aria-label="Role toggle">
            <button
              type="button"
              className={role === "viewer" ? "active" : undefined}
              onClick={() => onRoleChange("viewer")}
              aria-pressed={role === "viewer"}
            >
              Viewer
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : undefined}
              onClick={() => onRoleChange("admin")}
              aria-pressed={role === "admin"}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
