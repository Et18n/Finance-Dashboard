import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactCurrency, formatDate } from "../utils/formatters";

function tooltipLabelFormatter(dateString) {
  return formatDate(dateString);
}

function TrendChart({ data }) {
  if (!data.length) {
    return (
      <section className="panel reveal">
        <div className="panel-heading">
          <h3>Balance Trend</h3>
        </div>
        <div className="empty-state">
          <p>
            No trend data yet. Add transactions to visualize balance movement.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel reveal chart-panel">
      <div className="panel-heading">
        <h3>Balance Trend</h3>
        <p>Daily running balance based on transaction history.</p>
      </div>

      <div className="chart-wrap" aria-label="Balance trend chart">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#15957f" />
                <stop offset="100%" stopColor="#1f6d8c" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e5dccb" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(value))
              }
              tick={{ fill: "#58615f", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              tickFormatter={compactCurrency}
              tick={{ fill: "#58615f", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value) => compactCurrency(value)}
              labelFormatter={tooltipLabelFormatter}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #d8ccb4",
                background: "#fff8eb",
                color: "#253434",
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="url(#trendStroke)"
              strokeWidth={3}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TrendChart;
