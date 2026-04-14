import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import "./App.css";
import backgrounds from "./utils/backgrounds";
import { fetchCurrentWeather, fetchForecast } from "./services/WeatherService";

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
    if (weatherMain === "Fog" || weatherMain === "Mist" || weatherMain === "Haze") {
      return "foggy";
    }
    if (weatherMain === "Thunderstorm") return "stormy";
    return "sunny";
  };

  const weatherType = weatherData
    ? getWeatherType(weatherData.weather[0].main)
    : "sunny";

  const backgroundImage = backgrounds[weatherType];

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
    setSavedCities(savedCities.filter((savedCity) => savedCity !== cityNameToDelete));
  };

  const dailyForecast = forecastData
    ? forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5)
    : [];

return (
  <div className="app-container overlay">
    {backgroundImage && (
      <img
        src={backgroundImage}
        alt="Weather background"
        className="background-image"
      />
    )}
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

          <div className="card-grid">
            {dailyForecast.map((item) => (
              <div key={item.dt} className="forecast-card">
                <p className="forecast-date">{item.dt_txt.split(" ")[0]}</p>
                <p>{item.weather[0].main}</p>
                <p>{Math.round(item.main.temp)} °C</p>
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
  );
}

export default App;