import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import { categoryPalette } from "../data/transactions";
import { compactCurrency } from "../utils/formatters";

const fallbackColors = ["#de8850", "#247a86", "#7f9460", "#b75c72", "#7561a9"];

function renderActiveSlice(props) {
  return <Sector {...props} stroke="transparent" strokeWidth={0} />;
}

function SpendingBreakdownChart({ data }) {
  if (!data.length) {
    return (
      <section className="panel reveal">
        <div className="panel-heading">
          <h3>Spending Breakdown</h3>
        </div>
        <div className="empty-state">
          <p>
            Expense categories will appear once you add expense transactions.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel reveal chart-panel">
      <div className="panel-heading">
        <h3>Spending Breakdown</h3>
        <p>Where your money is going across categories.</p>
      </div>

      <div className="chart-wrap split">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Tooltip
              formatter={(value) => compactCurrency(value)}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #d8ccb4",
                background: "#fff8eb",
                color: "#253434",
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={66}
              outerRadius={96}
              dataKey="value"
              strokeWidth={0}
              stroke="transparent"
              activeShape={renderActiveSlice}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  stroke="transparent"
                  strokeWidth={0}
                  fill={
                    categoryPalette[entry.name] ??
                    fallbackColors[index % fallbackColors.length]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <ul className="chart-legend" aria-label="Spending breakdown legend">
          {data.slice(0, 6).map((item, index) => {
            const color =
              categoryPalette[item.name] ??
              fallbackColors[index % fallbackColors.length];

            return (
              <li key={item.name}>
                <span style={{ background: color }} />
                <p>{item.name}</p>
                <strong>{compactCurrency(item.value)}</strong>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default SpendingBreakdownChart;
