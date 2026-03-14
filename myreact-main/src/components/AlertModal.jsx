import React from "react";
import { AlertTriangle, X } from "lucide-react";

function AlertModal({ isOpen, aqiValue, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        {/*}
        <button className="alert-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        */}

        <div className="alert-content">
          <div className="alert-icon-wrapper">
            <AlertTriangle size={66} strokeWidth={1.5} />
          </div>

          <div className="alert-value-display">
            <span className="alert-aqi-label">CURRENT AQI</span>
            <span className="alert-aqi-value">{aqiValue}</span>
          </div>

          <h2 className="alert-message">
            Air quality is unhealthy.
            <br />
            Please limit outdoor activities!
          </h2>

          <button className="alert-action-btn" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
