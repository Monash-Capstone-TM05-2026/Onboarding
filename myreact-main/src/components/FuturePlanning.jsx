import React, { useState } from "react";
import { Info } from "lucide-react";

function FuturePlanning({
  locationName,
  tomorrowAdvice,
  tomorrowRiskText,
  tomorrowColor,
  tomorrowError,
  historicalInsight,
}) {
  return (
    <div className="lower-dashboard">
      <section
        className={`forecast-card enlarged-forecast ${tomorrowColor || ""} ${tomorrowError ? "error-state" : ""}`}
      >
        <div className="card-title">
          <span className="location-context">{locationName}</span>
          <span>Tomorrow's Outlook</span>
        </div>

        <div className="forecast-main-content">
          <div className="forecast-text">
            {tomorrowError
              ? tomorrowError
              : tomorrowAdvice || "No data available"}
          </div>

          {!tomorrowError && tomorrowRiskText && (
            <div className="forecast-badge">
              <span className="badge-label">EXPECTED</span>
              <span className="badge-value">{tomorrowRiskText}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default FuturePlanning;
