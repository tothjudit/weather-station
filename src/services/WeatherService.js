const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const fetchCurrentWeather = async (city) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni az aktuális időjárást.");
  }

  return response.json();
};

export const fetchForecast = async (city) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni az előrejelzést.");
  }

  return response.json();
};