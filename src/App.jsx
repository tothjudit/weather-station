import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import "./App.css";
import { fetchCurrentWeather, fetchForecast } from "./services/WeatherService";
import WeatherEffect from "./components/WeatherEffect";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [savedCities, setSavedCities] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [clockTick, setClockTick] = useState(Date.now());

  useEffect(() => {
    const storedCities = localStorage.getItem("savedCities");

    if (storedCities) {
      try {
        const parsed = JSON.parse(storedCities);

        const normalized = parsed.map((item) => {
          if (typeof item === "string") {
            return { name: item, country: "" };
          }

          return {
            name: item.name || "",
            country: item.country || "",
          };
        });

        setSavedCities(normalized);
      } catch (error) {
        console.error("Error reading saved cities:", error);
        setSavedCities([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedCities", JSON.stringify(savedCities));
  }, [savedCities]);

  useEffect(() => {
    const interval = setInterval(() => {
      setClockTick(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherType = (weatherMain) => {
    if (weatherMain === "Clear") return "sunny";
    if (weatherMain === "Clouds") return "cloudy";
    if (weatherMain === "Rain" || weatherMain === "Drizzle") return "rainy";
    if (weatherMain === "Snow") return "snowy";
    if (
      weatherMain === "Fog" ||
      weatherMain === "Mist" ||
      weatherMain === "Haze" ||
      weatherMain === "Smoke"
    ) {
      return "foggy";
    }
    if (weatherMain === "Thunderstorm") return "stormy";
    return "sunny";
  };

  const getWeatherIcon = (weatherMain) => {
    if (weatherMain === "Clear") return "☀️";
    if (weatherMain === "Clouds") return "☁️";
    if (weatherMain === "Rain" || weatherMain === "Drizzle") return "🌧️";
    if (weatherMain === "Snow") return "❄️";
    if (weatherMain === "Thunderstorm") return "⛈️";
    if (
      weatherMain === "Fog" ||
      weatherMain === "Mist" ||
      weatherMain === "Haze" ||
      weatherMain === "Smoke"
    ) {
      return "🌫️";
    }
    return "🌤️";
  };

  const getCountryName = (countryCode) => {
    if (!countryCode) return "";

    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode);
    } catch (error) {
      return countryCode;
    }
  };

  const getLocalDateByTimezone = (timezoneOffsetSeconds = 0) => {
    const utcTime =
      clockTick + new Date(clockTick).getTimezoneOffset() * 60 * 1000;
    return new Date(utcTime + timezoneOffsetSeconds * 1000);
  };

  const getLocalDateString = (timezoneOffsetSeconds = 0) => {
    const localDate = getLocalDateByTimezone(timezoneOffsetSeconds);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getLocalTimeString = (timezoneOffsetSeconds = 0) => {
    const localDate = getLocalDateByTimezone(timezoneOffsetSeconds);

    return localDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeOfDay = (timezoneOffsetSeconds = 0) => {
    const localDate = getLocalDateByTimezone(timezoneOffsetSeconds);
    const hour = localDate.getHours();

    return hour >= 5 && hour < 21 ? "time-day" : "time-night";
  };

  const getTimeOfDayLabel = (timezoneOffsetSeconds = 0) => {
    const localDate = getLocalDateByTimezone(timezoneOffsetSeconds);
    const hour = localDate.getHours();

    return hour >= 5 && hour < 21 ? "Day" : "Night";
  };

  const getLastUpdatedString = (dateValue, timezoneOffsetSeconds = 0) => {
    if (!dateValue) return "";

    const updatedDate = new Date(dateValue);
    const utcTime =
      updatedDate.getTime() + updatedDate.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(utcTime + timezoneOffsetSeconds * 1000);

    return localDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTodayKeyForCity = (timezoneOffsetSeconds = 0) => {
    const localDate = getLocalDateByTimezone(timezoneOffsetSeconds);
    return formatDateKey(localDate);
  };

  const getTomorrowAndNextDaysForecast = (
    forecastList,
    timezoneOffsetSeconds = 0
  ) => {
    if (!forecastList || forecastList.length === 0) return [];

    const todayKey = getTodayKeyForCity(timezoneOffsetSeconds);

    const groupedByDate = forecastList.reduce((acc, item) => {
      const dateKey = item.dt_txt.split(" ")[0];

      if (dateKey <= todayKey) return acc;

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(item);
      return acc;
    }, {});

    return Object.keys(groupedByDate)
      .sort()
      .slice(0, 4)
      .map((dateKey) => {
        const items = groupedByDate[dateKey];

        return items.reduce((closest, current) => {
          const closestHour = new Date(closest.dt_txt).getHours();
          const currentHour = new Date(current.dt_txt).getHours();

          return Math.abs(currentHour - 12) < Math.abs(closestHour - 12)
            ? current
            : closest;
        });
      });
  };

  const loadCityWeather = async (cityName) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const currentData = await fetchCurrentWeather(cityName);
      const forecastResult = await fetchForecast(cityName);

      setWeatherData(currentData);
      setForecastData(forecastResult);
      setCity(currentData.name);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error during search:", error);
      setWeatherData(null);
      setForecastData(null);
      setErrorMessage("City not found or weather data is unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      setErrorMessage("Please enter a city name.");
      return;
    }

    await loadCityWeather(city.trim());
  };

  const handleSaveCity = () => {
    if (!weatherData) return;

    const cityToSave = {
      name: weatherData.name,
      country: weatherData.sys.country,
    };

    const alreadySaved = savedCities.some(
      (savedCity) =>
        savedCity.name.toLowerCase() === cityToSave.name.toLowerCase() &&
        savedCity.country === cityToSave.country
    );

    if (alreadySaved) return;

    setSavedCities([...savedCities, cityToSave]);
  };

  const handleDeleteCity = (cityNameToDelete, countryToDelete) => {
    setSavedCities(
      savedCities.filter(
        (savedCity) =>
          !(
            savedCity.name === cityNameToDelete &&
            savedCity.country === countryToDelete
          )
      )
    );
  };

  const weatherType = weatherData
    ? getWeatherType(weatherData.weather[0].main)
    : "sunny";

  const forecastCards = useMemo(() => {
    if (!weatherData) return [];

    const todayKey = getTodayKeyForCity(weatherData.timezone);
    const todayCard = {
      dt: `today-${todayKey}`,
      dt_txt: `${todayKey} 12:00:00`,
      isTodayCard: true,
      weather: weatherData.weather,
      main: {
        temp: weatherData.main.temp,
      },
    };

    const nextDays = getTomorrowAndNextDaysForecast(
      forecastData?.list || [],
      weatherData.timezone
    );

    return [todayCard, ...nextDays];
  }, [forecastData, weatherData, clockTick]);

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const isToday = (item) => {
    return item.isTodayCard === true;
  };

  const timeOfDayClass = weatherData
    ? getTimeOfDay(weatherData.timezone)
    : getTimeOfDay();

  return (
    <div className={`app-container weather-${weatherType} ${timeOfDayClass}`}>
      <WeatherEffect weatherType={weatherType} />

      <div className="app-content">
        <Header />
        <SearchBar
          city={city}
          setCity={setCity}
          handleSearch={handleSearch}
          isLoading={isLoading}
        />

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {isLoading && (
          <div className="loading-message">Loading weather data...</div>
        )}

        {weatherData && !isLoading && (
          <div className="current-weather">
            <div className="current-weather-top">
              <div className="current-weather-icon">
                {getWeatherIcon(weatherData.weather[0].main)}
              </div>

              <div>
                <p className="location-line">
                  Location: {weatherData.name},{" "}
                  {getCountryName(weatherData.sys.country)}
                </p>
                <p className="meta-text">
                  Local date: {getLocalDateString(weatherData.timezone)}
                </p>
                <p className="meta-text">
                  Local time: {getLocalTimeString(weatherData.timezone)}
                </p>
                <p className="meta-text">
                  Time of day: {getTimeOfDayLabel(weatherData.timezone)}
                </p>
                <p className="meta-text">
                  Last updated:{" "}
                  {getLastUpdatedString(lastUpdated, weatherData.timezone)}
                </p>
              </div>
            </div>

            <p>Weather: {weatherData.weather[0].main}</p>
            <p>Description: {weatherData.weather[0].description}</p>
            <p>Temperature: {Math.round(weatherData.main.temp)} °C</p>

            <div className="save-button-wrap">
              <button className="primary-button" onClick={handleSaveCity}>
                Save city
              </button>
            </div>
          </div>
        )}

        {forecastCards.length > 0 && !isLoading && (
          <div className="section">
            <h2>5-day forecast</h2>

            <div className="forecast-grid">
              {forecastCards.map((item) => (
                <div
                  key={item.dt}
                  className={`forecast-card ${
                    isToday(item) ? "forecast-card-today" : ""
                  }`}
                >
                  {isToday(item) && <div className="today-badge">TODAY</div>}

                  <p className="forecast-date">{item.dt_txt.split(" ")[0]}</p>
                  <p className="forecast-day">{getDayName(item.dt_txt)}</p>
                  <div className="forecast-icon">
                    {getWeatherIcon(item.weather[0].main)}
                  </div>
                  <p className="forecast-weather">{item.weather[0].main}</p>
                  <p className="forecast-description">
                    {item.weather[0].description}
                  </p>
                  <p className="forecast-temp">{Math.round(item.main.temp)} °C</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {savedCities.length > 0 && (
          <div className="section">
            <h2>Saved cities</h2>

            <div className="card-grid">
              {savedCities.map((savedCity) => (
                <div
                  key={`${savedCity.name}-${savedCity.country}`}
                  className="saved-city-card"
                >
                  <p className="saved-city-name">{savedCity.name}</p>
                  <p className="saved-city-country">
                    {getCountryName(savedCity.country)}
                  </p>

                  <div className="saved-city-actions">
                    <button
                      className="secondary-button"
                      onClick={() => loadCityWeather(savedCity.name)}
                    >
                      Open
                    </button>

                    <button
                      className="danger-button"
                      onClick={() =>
                        handleDeleteCity(savedCity.name, savedCity.country)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;