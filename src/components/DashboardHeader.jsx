function DashboardHeader({ role, onRoleChange, theme, onThemeToggle }) {
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
          <div
            className="role-toggle"
            role="group"
            aria-label="Role toggle"
            data-role={role}
          >
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

          <div className="mobile-theme-row">
            <button
              type="button"
              className="header-theme-btn"
              onClick={onThemeToggle}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <span className="header-theme-icon" aria-hidden="true">
                {theme === "dark" ? (
                  <svg
                    className="sun-icon"
                    viewBox="0 0 24 24"
                    focusable="false"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4.6" />
                    <path d="M12 2.5v2.3M12 19.2v2.3M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6" />
                  </svg>
                ) : (
                  <svg
                    className="moon-icon"
                    viewBox="0 0 24 24"
                    focusable="false"
                    aria-hidden="true"
                  >
                    <path d="M14.2 2.4a9.8 9.8 0 1 0 7.4 14.8 9.3 9.3 0 0 1-5.8 1.9 9.5 9.5 0 0 1-9.5-9.5 9.3 9.3 0 0 1 7.9-9.2Z" />
                  </svg>
                )}
              </span>
              <span className="header-theme-text">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
