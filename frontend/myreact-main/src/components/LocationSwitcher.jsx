import React, { useState } from "react";
import { Search, Navigation, Loader2 } from "lucide-react";

function LocationSwitcher({
  locations,
  onSearch,
  onUseCurrentLocation,
  searchValue,
  onSearchValueChange,
  locationError,
  isLocating,
  isSearching,
}) {
  const [searchTermInternal, setSearchTermInternal] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const searchTerm = searchValue ?? searchTermInternal;
  const setSearchTerm = (nextValue) => {
    if (typeof onSearchValueChange === "function") {
      onSearchValueChange(nextValue);
    } else {
      setSearchTermInternal(nextValue);
    }
  };

  // Filter locations based on search term (AC4, AC6)
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredLocations =
    normalizedSearch === ""
      ? locations.slice(0, 10)
      : locations.filter((loc) =>
          loc.name.toLowerCase().includes(normalizedSearch),
        );

  const handleSelect = (loc) => {
    setSearchTerm(loc.name);
    setIsDropdownVisible(false);
  };

  const handleSearchClick = () => {
    if (isSearching) return;
    if (normalizedSearch === "") return;

    const exactMatch = locations.find(
      (l) => l?.name && l.name.toLowerCase() === normalizedSearch,
    );
    const selectedName =
      exactMatch?.name || filteredLocations[0]?.name || searchTerm.trim();

    if (!selectedName) return;

    setSearchTerm(selectedName);
    setIsDropdownVisible(false);
    onSearch(selectedName);
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
          <div>
            <img
              src="/AETHER_logo.png"
              alt="logo"
              style={{ width: "12rem", height: "11rem" }}
            />
          </div>
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
            <button
              className="search-btn"
              onClick={handleSearchClick}
              disabled={isSearching}
            >
              {isSearching ? "SEARCHING..." : "SEARCH"}
            </button>
          </div>

          {isDropdownVisible && (
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
