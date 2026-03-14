import React, { useState } from "react";
import { Search, Navigation, Loader2, Italic } from "lucide-react";

function LocationSwitcher({
  locations,
  onLocationChange,
  onUseCurrentLocation,
  locationError,
  isLocating,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Filter locations based on search term (AC4, AC6)
  const filteredLocations =
    searchTerm.trim() === ""
      ? []
      : locations.filter((loc) =>
          loc.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  const handleSelect = (loc) => {
    onLocationChange(loc.id);
    setSearchTerm(loc.name);
    setIsDropdownVisible(false);
  };

  const handleSearchClick = () => {
    // AC5: If there's a match, select the first one on search click
    if (filteredLocations.length > 0) {
      handleSelect(filteredLocations[0]);
    } else if (searchTerm.trim() !== "") {
      setIsDropdownVisible(true);
    }
  };

  return (
    <header className="location-header">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div
            className="title"
            style={{ fontSize: "2.5rem", paddingTop: "10px" }}
          >
            AETHER
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <span style={{ margin: "0 6px", fontSize: "4rem" }}>|</span>
              <div style={{ paddingTop: "8px" }}>
                <span
                  style={{
                    fontSize: "4rem",
                    fontWeight: "500",
                    fontfamily: "'Poppins', sans-serif",
                  }}
                >
                  Air Quality
                </span>
                <span style={{ marginLeft: "4px", fontSize: "1.5rem" }}>
                  in Malaysia
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            color: "gray",
            fontSize: "1.75rem",
            marginTop: "4px",
            fontStyle: "italic",
          }}
        >
          Real-Time AQI Monitoring & Insights
        </div>
      </div>

      <div className="location-controls">
        <div className="search-container">
          <label className="search-label">Search Your Location:</label>
          <div className="search-input-wrapper">
            {/* Search Bar */}
            <Search size={24} strokeWidth={1.5} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="e.g. Shah Alam, Penang..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownVisible(true);
              }}
              onFocus={() => setIsDropdownVisible(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
            />
            <button className="search-btn" onClick={handleSearchClick}>
              SEARCH
            </button>
          </div>

          {isDropdownVisible && searchTerm.trim() !== "" && (
            <ul className="search-results">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <li key={loc.id} onClick={() => handleSelect(loc)}>
                    {loc.name}
                  </li>
                ))
              ) : (
                <li className="no-results">No location found.</li>
              )}
            </ul>
          )}
        </div>

        <button
          className="use-location-btn"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          title="Use current location"
        >
          {/* The animation after clicking the button */}
          {isLocating ? (
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <Navigation size={24} strokeWidth={1.5} />
          )}
          <span>{isLocating ? "LOCATING..." : "Use Current Location"}</span>
        </button>
      </div>
      {/* The error message container when location is not found*/}
      {locationError && (
        <div className="location-error-msg">{locationError}</div>
      )}
    </header>
  );
}

export default LocationSwitcher;
