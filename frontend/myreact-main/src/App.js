import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import LocationSwitcher from "./components/LocationSwitcher";
import TodayDashboard from "./components/TodayDashboard";
import AlertModal from "./components/AlertModal";
import SeasonalTrends from "./components/SeasonalTrends";
import Forecasting from "./components/Forecasting";

const DEFAULT_LOCATION = "Subang Jaya";

function getRiskLevel(aqi) {
  if (aqi <= 50) return { color: "color-green", text: "GOOD" };
  if (aqi <= 100) return { color: "color-yellow", text: "MODERATE" };
  if (aqi <= 150) return { color: "color-orange", text: "UNHEALTHY" };
  return { color: "color-red", text: "HAZARDOUS" };
}

function toNumberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function normalizeHistoryRecordsToTrends(historyRecords) {
  const records = Array.isArray(historyRecords)
    ? historyRecords
    : Array.isArray(historyRecords?.data)
      ? historyRecords.data
      : Array.isArray(historyRecords?.history)
        ? historyRecords.history
        : Array.isArray(historyRecords?.monthly)
          ? historyRecords.monthly
          : [];

  if (records.length === 0) return [];

  const bucket = new Map();

  for (const item of records) {
    if (item?.isDeleted != null && Number(item.isDeleted) !== 0) continue;

    const pollutant = String(item?.pollutant ?? "").toLowerCase();
    if (pollutant && pollutant !== "aqi") continue;

    const recordDate = String(
      item?.recordDate ?? item?.date ?? item?.month ?? "",
    );
    const match = recordDate.match(/^\d{4}-([01]\d)-\d{2}$/);
    if (!match) continue;

    const monthNumber = Number(match[1]);
    if (!(monthNumber >= 1 && monthNumber <= 12)) continue;

    const value = toNumberOrNull(
      item?.concentration ?? item?.value ?? item?.avgAqi ?? item?.aqi,
    );
    if (value == null) continue;

    const monthIndex = monthNumber - 1;
    const prev = bucket.get(monthIndex) || { sum: 0, count: 0 };
    bucket.set(monthIndex, { sum: prev.sum + value, count: prev.count + 1 });
  }

  const trends = [];
  for (let i = 0; i < 12; i += 1) {
    const b = bucket.get(i);
    if (!b || b.count === 0) continue;
    const avg = b.sum / b.count;
    trends.push({ month: MONTH_LABELS[i], value: Number(avg.toFixed(1)) });
  }

  return trends;
}

function App() {
  const API_BASE_URL = "http://149.118.151.140:8080/api/air-quality";

  const [locations, setLocations] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const didLoadDefaultRef = useRef(false);

  const fetchJson = useCallback(async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return response.json();
  }, []);

  const loadLocations = useCallback(async () => {
    setIsLoadingLocations(true);
    setLocationError(null);
    try {
      const data = await fetchJson(`${API_BASE_URL}/locations`);
      console.log("Locations API:", data);
      const mapped = Array.isArray(data)
        ? data
            .filter((loc) => loc && loc.id != null && loc.areaName)
            .map((loc) => ({
              id: loc.id,
              name: loc.areaName,
              state: loc.state || "",
            }))
        : [];
      const dummyLocation = {
        id: -1, // use a negative or unique id so it doesn't clash
        name: "Testing Alert",
        state: "Test State",
      };
      setLocations([...mapped, dummyLocation]);
    } catch (e) {
      setLocations([]);
      setLocationError("Locations unavailable. Please refresh and try again.");
    } finally {
      setIsLoadingLocations(false);
    }
  }, [API_BASE_URL, fetchJson]);

  const resolveLocationIds = useCallback(
    async (locationText) => {
      const raw = String(locationText || "").trim();
      if (!raw) return [];

      const primary = raw.split(",")[0].trim();
      const candidates = [raw, primary].filter(Boolean);
      const normalizedCandidates = candidates.map((c) => c.toLowerCase());

      const uniqueById = (items) => {
        const seen = new Set();
        const out = [];
        for (const it of items) {
          const id = it?.id;
          if (id == null || seen.has(id)) continue;
          seen.add(id);
          out.push(it);
        }
        return out;
      };

      const orderExactMatches = (items) =>
        [...items].sort((a, b) => {
          const aStar = a?.state === "*" ? 1 : 0;
          const bStar = b?.state === "*" ? 1 : 0;
          if (aStar !== bStar) return bStar - aStar;
          return 0;
        });

      const findIdsInList = (list) => {
        const exactMatches = [];
        for (const c of normalizedCandidates) {
          for (const l of list) {
            if (l?.name && l.name.toLowerCase() === c) {
              exactMatches.push(l);
            }
          }
        }

        const uniqueExact = uniqueById(exactMatches);
        if (uniqueExact.length > 0)
          return orderExactMatches(uniqueExact).map((x) => x.id);

        for (const c of normalizedCandidates) {
          const fuzzyMatches = list.filter(
            (l) =>
              l?.name &&
              (l.name.toLowerCase().includes(c) ||
                c.includes(l.name.toLowerCase())),
          );
          const uniqueFuzzy = uniqueById(fuzzyMatches);
          if (uniqueFuzzy.length > 0) return uniqueFuzzy.map((x) => x.id);
        }

        return [];
      };

      const localIds = findIdsInList(locations);
      if (localIds.length > 0) return localIds;

      if (locations.length > 0) return [];

      try {
        const data = await fetchJson(`${API_BASE_URL}/locations`);
        const mapped = Array.isArray(data)
          ? data
              .filter((loc) => loc && loc.id != null && loc.areaName)
              .map((loc) => ({
                id: loc.id,
                name: loc.areaName,
                state: loc.state || "",
              }))
          : [];

        if (mapped.length > 0) setLocations(mapped);
        return findIdsInList(mapped);
      } catch {
        return [];
      }
    },
    [API_BASE_URL, fetchJson, locations],
  );

  const loadDashboardData = useCallback(
    async (location) => {
      const locationText = (location || "").trim();
      if (locationText === "Testing Alert") {
        const dummyCurrentAqi = 173;
        const dummyTomorrowAqi = 0;

        setDashboardData({
          locationName: "Testing Alert",
          currentApi: dummyCurrentAqi, // <-- match what displayData expects
          tomorrowApi: dummyTomorrowAqi,
          currentColor: "color-red",
          currentRiskText: "HAZARDOUS",
          currentAdvice: "Hazardous air quality — avoid outdoor exposure.",
          tomorrowRisk: null,
          tomorrowColor: null,
          tomorrowRiskText: "MODERATE",
          tomorrowAdvice:
            "Hazardous conditions expected, avoid outdoor activities.",
          error: null,
          trendsData: [],
          trendSummary: "",
          trendsSource: "history",
          trendsNote: "This is dummy data",
        });

        if (dummyCurrentAqi > 150) {
          setShowAlert(true);
        }

        return;
      }

      if (!locationText) {
        setDashboardData({
          locationName: "",
          currentApi: null,
          error: "Please enter a location.",
          trendsData: [],
          trendSummary: "",
          trendsSource: "history",
          trendsNote: "No seasonal trends available",
        });
        return;
      }

      setIsLoadingDashboard(true);
      setLocationError(null);
      try {
        const isDefaultLocation =
          locationText.toLowerCase() === DEFAULT_LOCATION.toLowerCase();

        const locationIds = await resolveLocationIds(locationText);
        if (locationIds.length === 0 && !isDefaultLocation) {
          setDashboardData({
            locationName: locationText,
            currentApi: null,
            error: "Unable to retrieve AQI data for this Location",
            tomorrowColor: "color-error",
            tomorrowRiskText: null,
            tomorrowError: "Unable to retrieve AQI data for this Location",
            tomorrowAdvice: "",
            trendsData: [],
            trendSummary: "",
            trendsSource: "history",
            trendsNote: "No seasonal trends available",
          });
          return;
        }

        const params = new URLSearchParams({ city: locationText });
        console.log("Calling API for city:", locationText);
        const data = await fetchJson(
          `${API_BASE_URL}/real-time/air-quality?${params}`,
        );
        console.log("AQI API RESPONSE:", data);

        const currentAqi = toNumberOrNull(data?.currentAqi);
        const tomorrowAqi = toNumberOrNull(data?.tomorrowAqi);

        const hasCurrent = currentAqi != null && currentAqi > 0;
        const hasTomorrow = tomorrowAqi != null;

        const currentRisk = hasCurrent ? getRiskLevel(currentAqi) : null;
        const tomorrowRisk = hasTomorrow ? getRiskLevel(tomorrowAqi) : null;

        let trendsData = [];
        let trendSummary = "";
        let trendsSource = "history";
        let trendsNote = "No seasonal trends available";

        try {
          const tried = [];
          for (const id of locationIds.slice(0, 5)) {
            tried.push(id);
            const historyRecords = await fetchJson(
              `${API_BASE_URL}/history/${encodeURIComponent(String(id))}`,
            );
            const normalized = normalizeHistoryRecordsToTrends(historyRecords);
            if (normalized.length > 0) {
              trendsData = normalized;
              trendsSource = "history";
              trendsNote = "";
              break;
            }
          }

          if (trendsSource !== "history") {
            trendsNote = "No seasonal trends available";
          }
        } catch {
          trendsData = [];
          trendSummary = "";
          trendsSource = "history";
          trendsNote = "No seasonal trends available";
        }

        setDashboardData({
          locationName: hasCurrent
            ? data.locationName || locationText
            : locationText,
          currentApi: hasCurrent ? currentAqi : null,
          tomorrowAqi: tomorrowAqi === 0 ? null : tomorrowAqi,
          lastUpdated: data.lastUpdated
            ? `Updated: ${new Date(data.lastUpdated).toLocaleString()}`
            : "",
          dataSource: "Air Quality Service",
          currentColor: currentRisk ? currentRisk.color : "",
          currentRiskText: currentRisk ? currentRisk.text : "",
          currentAdvice: data.currentAdvice || "",
          tomorrowColor: tomorrowRisk ? tomorrowRisk.color : "color-error",
          tomorrowRiskText: tomorrowRisk ? tomorrowRisk.text : null,
          tomorrowError: hasTomorrow
            ? null
            : "Tomorrow's air quality unavailable.",
          tomorrowAdvice: data.tomorrowAdvice || "",
          historicalInsight: data.historicalInsight,
          trendsData,
          trendSummary,
          trendsSource,
          trendsNote,
          error: hasCurrent
            ? null
            : "Unable to retrieve AQI data for this Location",
        });

        if (hasCurrent && currentAqi > 150) {
          setShowAlert(true);
        }
      } catch (e) {
        setDashboardData({
          locationName: locationText,
          currentApi: null,
          error: "Unable to retrieve AQI data for this Location",
          tomorrowColor: "color-error",
          tomorrowRiskText: null,
          tomorrowError: "Unable to retrieve AQI data for this Location",
          tomorrowAdvice: "",
          trendsData: [],
          trendSummary: "",
          trendsSource: "history",
          trendsNote: "No seasonal trends available",
        });
      } finally {
        setIsLoadingDashboard(false);
      }
    },
    [API_BASE_URL, fetchJson, resolveLocationIds],
  );

  const reverseGeocode = useCallback(async ({ latitude, longitude }) => {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`Geocode failed (${response.status})`);
    const data = await response.json();

    const address = data?.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.county;
    const state = address.state;
    const country = address.country;

    const parts = [city, state, country].filter(Boolean);
    const result = parts.join(", ");
    return result || data?.display_name || "";
  }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    try {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const locationText = await reverseGeocode(position.coords);

      if (!locationText) {
        setLocationError(
          "Unable to determine your city. Please search manually.",
        );
        return;
      }

      await loadDashboardData(locationText);
    } catch (error) {
      let errorMsg = "";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg =
            "Location access denied. Please enter the location in the search bar above.";
          break;

        case error.POSITION_UNAVAILABLE:
          errorMsg =
            "Location unavailable. Please check your internet connection or GPS.";
          break;

        case error.TIMEOUT:
          errorMsg =
            "Location request timed out. Please try again or search manually.";
          break;

        default:
          errorMsg =
            "Unable to determine your location. Please search manually.";
      }

      console.error("Geolocation error:", error);
      setLocationError(errorMsg);
    } finally {
      setIsLocating(false);
    }
  }, [loadDashboardData, reverseGeocode]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  /*useEffect(() => {
    if (didLoadDefaultRef.current) return;
    didLoadDefaultRef.current = true;
    loadDashboardData(DEFAULT_LOCATION);
  }, [loadDashboardData]); */

  const handleSearch = (locationText) => {
    setSearchValue(locationText);
    loadDashboardData(locationText);
  };

  const displayData =
    dashboardData ||
    (isLoadingDashboard
      ? {
          locationName: "",
          currentApi: null,
          error: "Searching...",
          trendsData: [],
          trendSummary: "",
          trendsSource: "history",
          trendsNote: "",
        }
      : isLoadingLocations
        ? {
            locationName: "",
            currentApi: null,
            error: "Loading locations...",
            trendsData: [],
            trendSummary: "",
            trendsSource: "history",
            trendsNote: "",
          }
        : {
            locationName: "",
            currentApi: null,
            error: "Search a location to view AQI.",
            trendsData: [],
            trendSummary: "",
            trendsSource: "history",
            trendsNote: "No seasonal trends available",
            tomorrowApi: null,
          });

  return (
    <div className={`App ${displayData.currentColor || ""}`}>
      <LocationSwitcher
        locations={locations}
        onSearch={handleSearch}
        onUseCurrentLocation={handleUseCurrentLocation}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        locationError={locationError}
        isLocating={isLocating}
        isSearching={isLoadingDashboard}
      />

      <main className="dashboard-main">
        <TodayDashboard
          locationName={displayData.locationName}
          currentApi={displayData.currentApi}
          currentAdvice={displayData.currentAdvice}
          tomorrowAdvice={displayData.tomorrowAdvice}
          currentRiskText={displayData.currentRiskText}
          currentColor={displayData.currentColor}
          error={displayData.error}
          lastUpdated={displayData.lastUpdated}
          dataSource={displayData.dataSource}
          seniorAdvice={displayData.seniorAdvice}
        />

        <div className="secondary-dashboard-grid">
          {/* <FuturePlanning
            locationName={dashboardData.locationName}
            currentAdvice={dashboardData.currentAdvice}
            tomorrowAdvice={dashboardData.tomorrowAdvice}
            tomorrowRiskText={dashboardData.tomorrowRiskText}
            tomorrowColor={dashboardData.tomorrowColor}
            tomorrowError={dashboardData.tomorrowError}
            historicalInsight={dashboardData.historicalInsight}
          /> */}
          <Forecasting
            locationName={displayData.locationName}
            tomorrowRiskText={displayData.tomorrowRiskText}
            tomorrowAqi={displayData.tomorrowAqi}
            tomorrowColor={displayData.tomorrowColor}
            tomorrowError={displayData.tomorrowError}
            tomorrowAdvice={displayData.tomorrowAdvice}
          />

          <div
            style={{
              borderTop: "0.5px solid rgba(0, 0, 0, 0.1)",
              paddingTop: "5%",
            }}
          >
            <SeasonalTrends
              trendsData={displayData.trendsData}
              trendSummary={displayData.trendSummary}
              trendsSource={displayData.trendsSource}
              trendsNote={displayData.trendsNote}
            />
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={showAlert}
        aqiValue={displayData.currentApi}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

export default App;
