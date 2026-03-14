import React from "react";
import { Wind } from "lucide-react";

function TodayDashboard({
  locationName,
  currentAdvice,
  currentRiskText,
  currentColor,
  currentApi,
  error,
  lastUpdated,
  dataSource,
  seniorAdvice,
}) {
  const hasValidData = currentApi !== null;
  const getAqiPosition = (aqi) => {
    if (aqi <= 50) return (aqi / 50) * 25;
    if (aqi <= 100) return 25 + ((aqi - 50) / 50) * 25;
    if (aqi <= 150) return 50 + ((aqi - 100) / 50) * 25;
    if (aqi <= 200) return 75 + ((aqi - 150) / 50) * 25;

    return 100;
  };
  //if we dont have the AQI data, we will show the error message
  if (!hasValidData) {
    return (
      <div className="upper-dashboard error-state">
        <div className="status-banner">
          <span className="location-tag">{locationName}</span>
          {/* Either if we just say no AQI data is available or use this error */}
          <div
            className="error_wind"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <div>
              <h1 className="conclusion-text" style={{ fontSize: "2.5rem" }}>
                Unable to retrieve AQI data
              </h1>
            </div>
            <div className="error-visual">
              <Wind
                size={80}
                strokeWidth={1}
                className="error-icon-main"
                style={{ transform: "translateY(15px)" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upper-dashboard">
      <div className="status-banner">
        <div className="banner-top">
          <span className="location-tag">{locationName}</span>
          <div className="trust-info">
            <span className="update-time">{lastUpdated}</span>
            <span className="data-source">Source: {dataSource}</span>
          </div>
        </div>
        <h1 className="conclusion-text">
          Air quality is{" "}
          <span className={`risk-text-highlight ${currentColor}`}>
            {currentRiskText}
          </span>
        </h1>
      </div>

      <div className="risk-card">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div
            className="aqi-scale-wrapper"
            style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}
          >
            {/* Vertical label */}
            <div className="aqi-vertical-label">
              AQI <span className="aqi-label-small">Air Quality Index</span>
            </div>

            {/* Color scale */}
            <div className="aqi-color-scale">
              <div
                className="aqi-slider"
                style={{ bottom: `${getAqiPosition(currentApi)}%` }}
              ></div>
            </div>
          </div>
          <div className="indicator-wrapper">
            <div className="risk-color-block"></div>
            <div className="aqi-display">
              <span className="aqi-value">{currentApi}</span>
              <span className="aqi-unit">AIR QUALITY LEVEL</span>
            </div>
          </div>
        </div>

        <div className="risk-info">
          <div className="senior-advice-box">
            <span className="advice-label">Today's Advice:</span>
            <div className="senior-advice-text">{currentAdvice}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodayDashboard;
