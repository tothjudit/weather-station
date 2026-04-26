import { useMemo } from "react";
import "./WeatherEffect.css";

function WeatherEffect({ weatherType }) {
  const rainDrops = useMemo(() => {
    return Array.from(
      { length: weatherType === "stormy" ? 70 : 45 },
      (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        duration: `${0.6 + Math.random() * 0.6}s`,
        delay: `${Math.random() * 2}s`,
        opacity: 0.35 + Math.random() * 0.5,
        height: 14 + Math.random() * 16,
      })
    );
  }, [weatherType]);

  const snowflakes = useMemo(() => {
    return Array.from({ length: 35 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      duration: `${4 + Math.random() * 4}s`,
      delay: `${Math.random() * 3}s`,
      size: `${10 + Math.random() * 14}px`,
      drift: `${-20 + Math.random() * 40}px`,
      opacity: 0.45 + Math.random() * 0.45,
    }));
  }, [weatherType]);

  const cloudItems = useMemo(() => {
    return [
      { id: 1, top: "10%", duration: "42s", scale: 1.1, delay: "0s" },
      { id: 2, top: "26%", duration: "56s", scale: 1.35, delay: "6s" },
      { id: 3, top: "52%", duration: "48s", scale: 1.2, delay: "2s" },
      { id: 4, top: "74%", duration: "62s", scale: 1.45, delay: "9s" },
    ];
  }, []);

const fogBands = useMemo(() => {
  return [
    { id: 1, top: "12%", duration: "24s", delay: "0s" },
    { id: 2, top: "28%", duration: "30s", delay: "2s" },
    { id: 3, top: "46%", duration: "26s", delay: "1s" },
    { id: 4, top: "64%", duration: "34s", delay: "3s" },
    { id: 5, top: "80%", duration: "28s", delay: "1.5s" },
  ];
}, []);

  return (
    <div className="weather-effect-layer">
      {weatherType === "rainy" && (
        <div className="effect-rain">
          {rainDrops.map((drop) => (
            <span
              key={drop.id}
              className="raindrop"
              style={{
                left: drop.left,
                animationDuration: drop.duration,
                animationDelay: drop.delay,
                opacity: drop.opacity,
                height: `${drop.height}px`,
              }}
            />
          ))}
        </div>
      )}

      {weatherType === "stormy" && (
        <div className="effect-storm">
          <div className="storm-flash"></div>
          {rainDrops.map((drop) => (
            <span
              key={drop.id}
              className="raindrop storm-drop"
              style={{
                left: drop.left,
                animationDuration: drop.duration,
                animationDelay: drop.delay,
                opacity: drop.opacity,
                height: `${drop.height}px`,
              }}
            />
          ))}
        </div>
      )}

      {weatherType === "snowy" && (
        <div className="effect-snow">
          {snowflakes.map((flake) => (
            <span
              key={flake.id}
              className="snowflake"
              style={{
                left: flake.left,
                animationDuration: flake.duration,
                animationDelay: flake.delay,
                fontSize: flake.size,
                opacity: flake.opacity,
                "--drift": flake.drift,
              }}
            >
              ❄
            </span>
          ))}
        </div>
      )}

      {weatherType === "cloudy" && (
        <div className="effect-clouds">
          {cloudItems.map((cloud) => (
            <div
              key={cloud.id}
              className="cloud"
              style={{
                top: cloud.top,
                animationDuration: cloud.duration,
                animationDelay: cloud.delay,
                transform: `scale(${cloud.scale})`,
              }}
            >
              <span className="cloud-middle"></span>
            </div>
          ))}
        </div>
      )}

      {weatherType === "foggy" && (
        <div className="effect-fog">
          {fogBands.map((band) => (
            <div
              key={band.id}
              className="fog-band"
              style={{
                top: band.top,
                animationDuration: band.duration,
                animationDelay: band.delay,
              }}
            />
          ))}
        </div>
      )}

      {weatherType === "sunny" && (
        <div className="effect-sunny">
          <div className="sun-glow"></div>
          <div className="sun-rays"></div>
        </div>
      )}
    </div>
  );
}

export default WeatherEffect;