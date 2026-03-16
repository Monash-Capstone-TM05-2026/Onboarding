import React from "react";
// we will be using the currentAPI as a holder, we will use the forecasted avg
function Forecasting({
  locationName,
  tomorrowRiskText,
  tomorrowAqi,
  tomorrowColor,
  tomorrowError,
  tomorrowAdvice,
}) {
  const isError = tomorrowError != null || tomorrowAqi == null;
  console.log(
    "Forecasting color:",
    tomorrowColor,
    "tommorrowAQI:",
    tomorrowAqi,
  );
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
            {!isError ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div className="risk-card">
                    <div className="indicator-wrapper">
                      <div
                        className={`risk-color-block ${tomorrowColor || ""}`}
                      ></div>
                      <div className="aqi-display">
                        <span className="aqi-value">{tomorrowAqi}</span>
                        <span
                          className="aqi-unit"
                          style={{ paddingTop: "20px" }}
                        >
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
                <div className="risk-info">
                  <div
                    className="senior-advice-box"
                    style={{ marginBottom: "10%" }}
                  >
                    <span className="advice-label">NEXT DAY ADVICE:</span>
                    <div className="senior-advice-text">{tomorrowAdvice}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="senior-advice-text" style={{ fontSize: "25px" }}>
                😴Tomorrow's Outlook is taking a short nap！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forecasting;
