import { useEffect, useState } from "react";
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

  useEffect(() => {
    const storedCities = localStorage.getItem("savedCities");
    if (storedCities) {
      setSavedCities(JSON.parse(storedCities));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedCities", JSON.stringify(savedCities));
  }, [savedCities]);

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

  const loadCityWeather = async (cityName) => {
    try {
      const currentData = await fetchCurrentWeather(cityName);
      const forecastResult = await fetchForecast(cityName);

      setWeatherData(currentData);
      setForecastData(forecastResult);
      setCity(cityName);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      console.log("No city name entered.");
      return;
    }

    await loadCityWeather(city);
  };

  const handleSaveCity = () => {
    if (!weatherData) return;

    const cityName = weatherData.name;

    if (savedCities.includes(cityName)) return;

    setSavedCities([...savedCities, cityName]);
  };

  const handleDeleteCity = (cityNameToDelete) => {
    setSavedCities(
      savedCities.filter((savedCity) => savedCity !== cityNameToDelete)
    );
  };

  const weatherType = weatherData
    ? getWeatherType(weatherData.weather[0].main)
    : "sunny";

  const dailyForecast = forecastData
    ? forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5)
    : [];

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const isToday = (dateString) => {
    const forecastDate = new Date(dateString);
    const today = new Date();

    return (
      forecastDate.getFullYear() === today.getFullYear() &&
      forecastDate.getMonth() === today.getMonth() &&
      forecastDate.getDate() === today.getDate()
    );
  };

  return (
    <div className={`app-container weather-${weatherType}`}>
      <WeatherEffect weatherType={weatherType} />

      <div className="app-content">
        <Header />
        <SearchBar city={city} setCity={setCity} handleSearch={handleSearch} />

        {weatherData && (
          <div className="current-weather">
            <p>City: {weatherData.name}</p>
            <p>Main weather type: {weatherData.weather[0].main}</p>
            <p>Description: {weatherData.weather[0].description}</p>
            <p>Temperature: {Math.round(weatherData.main.temp)} °C</p>

            <div className="save-button-wrap">
              <button className="primary-button" onClick={handleSaveCity}>
                Save city
              </button>
            </div>
          </div>
        )}

        {dailyForecast.length > 0 && (
          <div className="section">
            <h2>5-day forecast</h2>

            <div className="forecast-grid">
              {dailyForecast.map((item) => (
                <div
                  key={item.dt}
                  className={`forecast-card ${
                    isToday(item.dt_txt) ? "forecast-card-today" : ""
                  }`}
                >
                  {isToday(item.dt_txt) && (
                    <div className="today-badge">Today</div>
                  )}

                  <p className="forecast-date">{item.dt_txt.split(" ")[0]}</p>
                  <p className="forecast-day">{getDayName(item.dt_txt)}</p>
                  <div className="forecast-icon">
                    {getWeatherIcon(item.weather[0].main)}
                  </div>
                  <p className="forecast-weather">{item.weather[0].main}</p>
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
                <div key={savedCity} className="saved-city-card">
                  <p className="saved-city-name">{savedCity}</p>

                  <div className="saved-city-actions">
                    <button
                      className="secondary-button"
                      onClick={() => loadCityWeather(savedCity)}
                    >
                      Open
                    </button>

                    <button
                      className="danger-button"
                      onClick={() => handleDeleteCity(savedCity)}
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