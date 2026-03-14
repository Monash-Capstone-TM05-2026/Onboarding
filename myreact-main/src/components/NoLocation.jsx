<div>
  {condition ? <span>Condition is true</span> : <span>Condition is false</span>}
</div>;

import React from "react";
// we will be using the currentAPI as a holder, we will use the forecasted avg
function Forecasting({
  locationName,
  tomorrowRiskText,
  currentApi,
  tomorrowColor,
  tomorrowError,
}) {
  const isError = Boolean(tomorrowError);
  return (
    <div className="forecasting-section">
      <div className={`forecast-card enlarged-forecast ${tomorrowColor || ""}`}>
        <div className="card-title2">
          <span className="location-context">{locationName}</span>
          <span>Tomorrow's Outlook</span>
        </div>
        {/* the content */}
        <div className="forecast-main-content2">
          <div>
            {/* if we dont have error, show the AQI*/}
            {condition ? (
              <div>
                <div className="risk-card">
                  <div className="indicator-wrapper">
                    <div className="risk-color-block"></div>
                    <div className="aqi-display">
                      <span className="aqi-value">{currentApi}</span>
                      <span className="aqi-unit" style={{ paddingTop: "20px" }}>
                        AVERAGE <br /> AIR QUALITY LEVEL
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  {/* Only show the badge if there is no error and we have a risk lable to display */}
                  {!tomorrowError && tomorrowRiskText && (
                    <div className="forecast-badge2">
                      <span className="badge-label">
                        Expected Air Quality to Be
                      </span>
                      <span className="badge-value">{tomorrowRiskText}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>Forecast Unavailable</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
