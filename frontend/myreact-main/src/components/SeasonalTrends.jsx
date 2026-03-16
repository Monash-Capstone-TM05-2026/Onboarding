import React from "react";
import { TrendingUp } from "lucide-react";

function SeasonalTrends({
  trendsData,
  trendSummary,
  trendsSource,
  trendsNote,
}) {
  if (!trendsData || trendsData.length === 0) {
    return (
      <div className="seasonal-trends-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div>No seasonal trends available 😴</div>
        </div>
      </div>
    );
  }

  // Simple SVG Sparkline Chart logic
  const width = 800;
  const height = 150;
  const padding = 20;

  const maxVal = Math.max(...trendsData.map((d) => d.value));
  const minVal = Math.min(...trendsData.map((d) => d.value));
  const range = maxVal - minVal || 1;

  const points = trendsData
    .map((d, i) => {
      const x = (i * (width - padding * 2)) / (trendsData.length - 1) + padding;
      const y =
        height -
        padding -
        ((d.value - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  //get three highest peaks indexes
  const peakIndexes = trendsData
    .map((d, i) => ({ value: d.value, index: i }))
    .sort((a, b) => b.value - a.value) // sort descending
    .slice(0, 3) // take top 3
    .map((d) => d.index); // get their original indexes

  return (
    <div className="seasonal-trends-container">
      <div className="card-title">
        <TrendingUp size={30} strokeWidth={1.5} />
        <span>Seasonal Patterns & Trends</span>
      </div>

      <div className="trends-chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="trends-svg">
          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1"
          />

          {/* Main trend line */}
          <polyline
            fill="none"
            stroke="var(--ochre-vibrant)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="trend-line-path"
          />
          {trendsData.map((d, i) => {
            if (!peakIndexes.includes(i)) return null; // only top 3 peaks

            const x =
              (i * (width - padding * 2)) / (trendsData.length - 1) + padding;
            const y =
              height -
              padding -
              ((d.value - minVal) / range) * (height - padding * 2);

            return (
              <circle
                key={`peak-${i}`}
                cx={x}
                cy={y}
                r={6}
                fill="red"
                stroke="white"
                strokeWidth={2}
              />
            );
          })}

          {/* Month Labels */}
          {trendsData.map((d, i) => {
            const x =
              (i * (width - padding * 2)) / (trendsData.length - 1) + padding;
            return (
              <text
                key={i}
                x={x}
                y={height - 2}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="var(--text-main)"
                className="month-label"
              >
                {d.month}
              </text>
            );
          })}
        </svg>
      </div>

      {/*<div className="trend-insight-box">
        <div className="insight-icon">
          <AlertCircle size={18} strokeWidth={1.5} />
        </div>
        <p className="insight-text">{trendSummary}</p>
      </div>*/}
    </div>
  );
}

export default SeasonalTrends;
