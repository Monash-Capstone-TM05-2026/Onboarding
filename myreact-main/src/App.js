import React, { useState, useEffect } from "react";
import "./App.css";
import LocationSwitcher from "./components/LocationSwitcher";
import TodayDashboard from "./components/TodayDashboard";
import FuturePlanning from "./components/FuturePlanning";
import AlertModal from "./components/AlertModal";
import SeasonalTrends from "./components/SeasonalTrends";
import Forecasting from "./components/Forecasting";

function App() {
  const locations = [
    { id: 1, name: "Shah Alam" },
    { id: 2, name: "Subang Jaya" },
    { id: 3, name: "Klang" },
    { id: 4, name: "Petaling Jaya" },
    { id: 5, name: "Kuala Lumpur" },
    { id: 6, name: "Johor Bahru" },
    { id: 7, name: "Penang" },
    { id: 8, name: "Ipoh" },
    { id: 9, name: "Malacca" },
    { id: 10, name: "Kuantan" },
    { id: 999, name: "No Data Test" },
  ];

  const [selectedLocationId, setSelectedLocationId] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const fetchDashboardData = (locationId) => {
    setLocationError(null);

    const mockTrends = [
      { month: "Jan", value: 45 },
      { month: "Feb", value: 50 },
      { month: "Mar", value: 55 },
      { month: "Apr", value: 75 },
      { month: "May", value: 85 },
      { month: "Jun", value: 95 },
      { month: "Jul", value: 110 },
      { month: "Aug", value: 105 },
      { month: "Sep", value: 80 },
      { month: "Oct", value: 65 },
      { month: "Nov", value: 50 },
      { month: "Dec", value: 40 },
    ];

    const mockDataMap = {
      1: {
        locationName: "Shah Alam",
        currentApi: 45,
        tomorrowApi: 55,
        lastUpdated: "Updated: 10:00 AM",
        dataSource: "Department of Environment",
        seniorAdvice:
          "✅ Air is clean. Perfect for a gentle morning walk or gardening.",
        tomorrowAdvice:
          "📅 Outlook: Clarity continues through the morning, gentle haze in the afternoon.",
        historicalInsight:
          "💡 Historical context: March traditionally maintains a balanced air quality baseline. The last 3 years have seen steady improvement.",
        trendsData: mockTrends,
        trendSummary:
          "💡 Seasonal Alert: High-risk periods identified during June to August. Plan your outdoor exercise before 8 AM during these months.",
      },
      2: {
        locationName: "Subang Jaya",
        currentApi: 160,
        tomorrowApi: 110,
        lastUpdated: "Updated: 10:15 AM",
        dataSource: "Department of Environment",
        seniorAdvice:
          "🟡 Air is slightly hazy. Keep windows closed and avoid heavy outdoor tasks.",
        tomorrowAdvice:
          "📅 Outlook: Increasing concentration expected tomorrow. Indoor settings advised.",
        historicalInsight:
          "💡 Historical context: Local patterns indicate elevated activity during industrial transitions. Air quality usually improves after the monsoon begins.",
        trendsData: mockTrends.map((d) => ({ ...d, value: d.value + 20 })),
        trendSummary:
          "💡 Seasonal Alert: Subang Jaya typically experiences peak pollution in July. Ensure your air purifiers are maintained by then.",
      },
      3: {
        locationName: "Klang",
        currentApi: 125,
        tomorrowApi: 95,
        lastUpdated: "Updated: 10:30 AM",
        dataSource: "National Monitoring Station",
        seniorAdvice:
          "⚠️ CAUTION: Air is unhealthy. Please stay indoors and use a mask if you must go out.",
        tomorrowAdvice:
          "📅 Outlook: Atmospheric clearing projected for tomorrow evening.",
        historicalInsight:
          "💡 Historical context: Coastal patterns often aggregate seasonal smog. Historically, air quality is best from October to February.",
        trendsData: mockTrends.map((d) => ({ ...d, value: d.value + 40 })),
        trendSummary:
          "💡 Seasonal Alert: Coastal Klang is prone to sea-breeze haze. High-risk peaks occur annually between July and September.",
      },
      4: {
        locationName: "Petaling Jaya",
        currentApi: 65,
        lastUpdated: "Updated: 10:45 AM",
        dataSource: "Department of Environment",
        seniorAdvice:
          "🟡 Moderate conditions. Safe for short outings, but keep an eye on how you feel.",
        historicalInsight: "Urban density affects air quality.",
        trendsData: mockTrends,
        trendSummary:
          "💡 Seasonal Alert: Moderate risk detected in mid-year. High-risk peaks are less frequent but notable in August.",
      },
      5: {
        locationName: "Kuala Lumpur",
        currentApi: 75,
        tomorrowApi: 80,
        lastUpdated: "Updated: 11:00 AM",
        dataSource: "City Monitoring Center",
        seniorAdvice:
          "🟡 City air is moderate. Best to stay in air-conditioned areas during peak traffic.",
        tomorrowAdvice: "📅 Outlook: Haze expected in the evening.",
        historicalInsight: "High traffic contributes to pollutants.",
        trendsData: mockTrends.map((d) => ({ ...d, value: d.value + 15 })),
        trendSummary:
          "💡 Seasonal Alert: City center smog peaks during dry months (June-Sept). Traffic adds 20% to pollution during these times.",
      },
      6: {
        locationName: "Johor Bahru",
        currentApi: 55,
        tomorrowApi: 60,
        lastUpdated: "Updated: 11:15 AM",
        dataSource: "Southern Region Hub",
        seniorAdvice:
          "🟡 Fair conditions. A good day for indoor hobbies or light patio sitting.",
        tomorrowAdvice: "Similar conditions tomorrow.",
        historicalInsight: "Border traffic can affect air quality.",
        trendsData: mockTrends,
        trendSummary:
          "💡 Seasonal Alert: Cross-border haze peaks during late Q3. Stable air quality usually returns by November.",
      },
      7: {
        locationName: "Penang",
        currentApi: 35,
        tomorrowApi: 40,
        lastUpdated: "Updated: 11:30 AM",
        dataSource: "Island Monitoring Post",
        seniorAdvice:
          "✅ Fresh island air! Ideal for any outdoor activities or social gatherings.",
        tomorrowAdvice: "Clear skies ahead.",
        historicalInsight: "Island geography helps disperse pollutants.",
        trendsData: mockTrends.map((d) => ({ ...d, value: d.value - 10 })),
        trendSummary:
          "💡 Seasonal Alert: Penang enjoys optimal air quality year-round, with only minor dips in July.",
      },
      8: {
        locationName: "Ipoh",
        currentApi: 70,
        tomorrowApi: 75,
        lastUpdated: "Updated: 11:45 AM",
        dataSource: "Perak Environment Dept",
        seniorAdvice:
          "🟡 Haze is present. Stay hydrated and avoid walking near busy roads.",
        tomorrowAdvice: "Haze expected in the morning.",
        historicalInsight: "Limestone hills can trap pollutants.",
        trendsData: mockTrends,
        trendSummary:
          "💡 Seasonal Alert: Geographic basin effect traps morning haze between May and July. Early morning walks are safest in Q1.",
      },
      9: {
        locationName: "Malacca",
        currentApi: 48,
        tomorrowApi: 42,
        lastUpdated: "Updated: 12:00 PM",
        dataSource: "Historical City Station",
        seniorAdvice:
          "✅ Good air quality. Enjoy the historical sites with a comfortable stroll.",
        tomorrowAdvice: "Perfect for a walk.",
        historicalInsight: "Coastal winds keep the air fresh.",
        trendsData: mockTrends,
        trendSummary:
          "💡 Seasonal Alert: Excellent stability. Minor coastal haze possible in late August.",
      },
      10: {
        locationName: "Kuantan",
        currentApi: 95,
        tomorrowApi: 105,
        lastUpdated: "Updated: 12:15 PM",
        dataSource: "East Coast Station",
        seniorAdvice:
          "🟡 High moderate. Sensitive individuals should limit outdoor exposure.",
        tomorrowAdvice: "Risk of haze from the east.",
        historicalInsight: "Monsoon season can impact air quality.",
        trendsData: mockTrends.map((d) => ({ ...d, value: d.value + 10 })),
        trendSummary:
          "💡 Seasonal Alert: Monsoon transitions (May/Oct) are high-risk periods. Monitor easterly winds for early warnings.",
      },
      100: {
        locationName: "Your Current Location",
        currentApi: 32,
        tomorrowApi: 35,
        lastUpdated: "Updated: Just Now",
        dataSource: "Local Hyper-Local Sensor",
        seniorAdvice:
          "✅ Your immediate surroundings are clear. Safe for all activities.",
        tomorrowAdvice:
          "📅 Outlook: Clear skies expected for the next 48 hours.",
        historicalInsight:
          "💡 Historical context: This area consistently maintains high air quality standards. Over the last 5 years, pollution levels have remained below the national safety threshold.",
        trendsData: mockTrends.map((d) => ({ ...d, value: d.value - 15 })),
        trendSummary:
          "💡 Seasonal Alert: Your area is historically stable. Peak safety is maintained from December through April.",
      },
    };

    const baseData = mockDataMap[locationId];

    if (!baseData) {
      setDashboardData({
        locationName: "Unknown Location",
        currentApi: null,
        tomorrowError: "Unable to retrieve air quality data for this location.",
        error: "Unable to retrieve air quality data for this location.",
        currentColor: "color-error",
        tomorrowDataAvailable: false,
      });
      return;
    }

    // Helper to get color/text by AQI
    const getRiskLevel = (aqi) => {
      if (aqi <= 50) return { color: "color-green", text: "GOOD" };
      if (aqi <= 100) return { color: "color-yellow", text: "MODERATE" };
      if (aqi <= 150) return { color: "color-orange", text: "UNHEALTHY" };
      return { color: "color-red", text: "HAZARDOUS" };
    };

    // updating both currentrisk and tomorrow risk color and text based on the AQI value
    const currentRisk = getRiskLevel(baseData.currentApi);
    const tomorrowDataAvailable =
      baseData.tomorrowApi !== undefined && baseData.tomorrowApi !== null;
    const tomorrowRisk = tomorrowDataAvailable
      ? getRiskLevel(baseData.tomorrowApi)
      : null;

    const finalData = {
      ...baseData,
      currentColor: currentRisk.color,
      currentRiskText: currentRisk.text,
      tomorrowColor: tomorrowRisk ? tomorrowRisk.color : "color-error",
      tomorrowRiskText: tomorrowRisk ? tomorrowRisk.text : null,
      tomorrowError: tomorrowDataAvailable
        ? null /* No error if data is available */
        : "Currently unable to retrieve air quality data for this location." /*else show error message*/,
      currentAdvice:
        currentRisk.text === "GOOD"
          ? "✅ Atmosphere is serene and safe for outdoor leisure"
          : currentRisk.text === "MODERATE"
            ? "🟡 Ambient air is moderate, mindful activity recommended"
            : currentRisk.text === "UNHEALTHY"
              ? "⚠️ Caution: Atmospheric quality is currently compromised"
              : "🚨 Hazardous air quality — avoid outdoor exposure",

      tomorrowAdvice: tomorrowRisk
        ? tomorrowRisk.text === "GOOD"
          ? "Clear skies and fresh air expected tomorrow"
          : tomorrowRisk.text === "MODERATE"
            ? "Moderate conditions expected, consider indoor plans"
            : tomorrowRisk.text === "UNHEALTHY"
              ? "Unhealthy conditions expected, stay indoors if possible"
              : "Hazardous conditions expected, avoid outdoor activities"
        : "Tomorrow's air quality data unavailable",
    };

    setDashboardData(finalData);

    if (baseData.currentApi > 150) {
      setShowAlert(true);
    }
  };

  const handleUseCurrentLocation = () => {
    console.log("handleUseCurrentLocation triggered"); // Debugging

    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by your browser.";
      console.error(errorMsg);
      setLocationError(errorMsg);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    /* location logic */
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Geolocation success:", position);
        // Force a refresh if it's already 100 by calling fetch directly or toggling a refresh state
        setSelectedLocationId(100);
        fetchDashboardData(100);
        setIsLocating(false);
      },
      (error) => {
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
            errorMsg = "Location error. Please use the manual search feature.";
        }
        console.error("Geolocation error:", error);
        setLocationError(errorMsg);
        setIsLocating(false);
      },
      options,
    );
  };

  useEffect(() => {
    fetchDashboardData(selectedLocationId);

    //fetch data every hour
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getMinutes() === 0) {
        console.log(`Auto-refreshing data for hour: ${now.getHours()}`);
        fetchDashboardData(selectedLocationId);
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [selectedLocationId]);

  if (!dashboardData)
    return <div className="initializing">Initializing...</div>;

  return (
    <div className={`App ${dashboardData.currentColor}`}>
      <LocationSwitcher
        locations={locations}
        onLocationChange={setSelectedLocationId}
        onUseCurrentLocation={handleUseCurrentLocation}
        locationError={locationError}
        isLocating={isLocating}
      />

      <main className="dashboard-main">
        <TodayDashboard
          locationName={dashboardData.locationName}
          currentApi={dashboardData.currentApi}
          currentAdvice={dashboardData.currentAdvice}
          tomorrowAdvice={dashboardData.tomorrowAdvice}
          currentRiskText={dashboardData.currentRiskText}
          currentColor={dashboardData.currentColor}
          error={dashboardData.error}
          lastUpdated={dashboardData.lastUpdated}
          dataSource={dashboardData.dataSource}
          seniorAdvice={dashboardData.seniorAdvice}
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
            locationName={dashboardData.locationName}
            tomorrowRiskText={dashboardData.tomorrowRiskText}
            currentApi={dashboardData.currentApi}
            tomorrowColor={dashboardData.tomorrowColor}
            tomorrowError={dashboardData.tomorrowError}
            tomorrowAdvice={dashboardData.tomorrowAdvice}
          />

          <div
            style={{
              borderTop: "0.5px solid rgba(0, 0, 0, 0.1)",
              paddingTop: "5%",
            }}
          >
            <SeasonalTrends
              trendsData={dashboardData.trendsData}
              trendSummary={dashboardData.trendSummary}
            />
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={showAlert}
        aqiValue={dashboardData.currentApi}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

export default App;
