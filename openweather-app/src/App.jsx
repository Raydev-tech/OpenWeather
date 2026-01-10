import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Loader2, CloudRain, Sun, CloudSun, Snowflake, MapPin } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [city, setCity] = useState("Lagos"); // default city
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [hourly, setHourly] = useState([]);
  const audioCtx = useRef(null);
  const toastId = useRef(null);

  const apiKey = "a23fcbae71617e18cd507abaad7182e6";

  // Play pleasant beep
  const playBeep = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const fetchWeather = async (searchCity = city) => {
    if (!apiKey) {
      toast.error("❌ API Key missing! Check your .env file.");
      return;
    }
    if (!searchCity) return;

    setStatus("loading");
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          searchCity
        )}&units=metric&appid=${apiKey}`
      );
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          searchCity
        )}&units=metric&appid=${apiKey}`
      );

      setWeather(res.data);
      setHourly(forecastRes.data.list.slice(0, 12));
      setError("");
      setStatus("success");
      playBeep();
    } catch (err) {
      setWeather(null);
      setHourly([]);
      setStatus("error");
      setError("😕 City not found. Try another.");
    }
  };

  const getIcon = () => {
    const code = weather?.weather?.[0]?.icon;
    return `https://openweathermap.org/img/wn/${code}@2x.png`;
  };

  const getFallbackIcon = () => {
    const desc = weather?.weather?.[0]?.main?.toLowerCase() || "";
    if (desc.includes("cloud")) return <CloudSun className="icon" />;
    if (desc.includes("rain")) return <CloudRain className="icon" />;
    if (desc.includes("snow")) return <Snowflake className="icon" />;
    return <Sun className="icon" />;
  };

  // Online/offline detection
  useEffect(() => {
    const checkOnline = () => {
      if (!navigator.onLine) {
        if (!toastId.current) {
          toastId.current = toast.error("⚠️ No internet connection", { duration: Infinity, id: "offline-toast" });
        }
      } else {
        toast.dismiss("offline-toast");
        toastId.current = null;
      }
    };
    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", checkOnline);
    checkOnline();
    return () => {
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", checkOnline);
    };
  }, []);

  // Fetch default city weather on first load
  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="container">
      <Toaster />
      <div className="card">
        <h1 className="title">🌦 Weather Finder</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={() => fetchWeather(city)} disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="loader" /> : "Search"}
          </button>
        </div>

        {status === "error" && <p className="error">{error}</p>}

        {status === "success" && weather && (
          <div className="weather-section">
            <div className="current-weather">
              <h2 className="city">
                <MapPin className="map-icon" />
                {weather.name}, {weather.sys.country}
              </h2>
              {weather.weather?.[0]?.icon ? (
                <img src={getIcon()} alt="weather icon" className="weather-icon" />
              ) : (
                <div className="weather-icon">{getFallbackIcon()}</div>
              )}
              <p className="temperature">🌡 {weather.main.temp}°C</p>
              <p>💧 Humidity: {weather.main.humidity}%</p>
              <p>🌬 Wind: {weather.wind.speed} m/s</p>
              <p className="condition">🌥 Condition: {weather.weather[0].description}</p>
            </div>

            <div className="hourly-forecast">
              <h3>Hourly Forecast</h3>
              <div className="hourly-grid">
                {hourly.map((h, i) => (
                  <div key={i} className="hour-card">
                    <p>{new Date(h.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="hour-temp">{Math.round(h.main.temp)}°C</p>
                    <p className="hour-condition">{h.weather[0].description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #85d8ce, #f8ffae, #ff9a9e);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .container {
          padding: 20px;
          width: 100%;
          max-width: 550px;
        }

        .card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          text-align: center;
        }

        .title {
          font-size: 2rem;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 20px;
        }

        .search-box {
          display: flex;
          border: 2px solid #60a5fa;
          border-radius: 50px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .search-box input {
          flex: 1;
          padding: 12px 20px;
          border: none;
          outline: none;
          font-size: 1rem;
        }

        .search-box button {
          background-color: #2563eb;
          color: white;
          font-weight: 600;
          padding: 0 20px;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }

        .search-box button:hover {
          background-color: #1d4ed8;
        }

        .loader {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          color: #dc2626;
          font-weight: 500;
          margin-top: 10px;
        }

        .current-weather {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .city {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          gap: 8px;
          margin-bottom: 10px;
        }

        .map-icon {
          color: #3b82f6;
        }

        .weather-icon {
          width: 80px;
          height: 80px;
          margin: 10px 0;
        }

        .icon {
          width: 50px;
          height: 50px;
          color: #3b82f6;
        }

        .temperature {
          font-size: 1.3rem;
          font-weight: bold;
        }

        .condition {
          text-transform: capitalize;
        }

        .hourly-forecast h3 {
          margin-bottom: 10px;
        }

        .hourly-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .hour-card {
          background: rgba(255,255,255,0.9);
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          font-size: 0.9rem;
        }

        .hour-temp {
          font-weight: bold;
          margin: 5px 0;
        }

        .hour-condition {
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .hourly-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .search-box input {
            padding: 10px 15px;
          }

          .search-box button {
            padding: 0 15px;
          }
        }

        @media (max-width: 480px) {
          .hourly-grid {
            grid-template-columns: 1fr;
          }

          .card {
            padding: 20px;
          }

          .title {
            font-size: 1.6rem;
          }

          .current-weather {
            padding: 15px;
          }

          .weather-icon {
            width: 60px;
            height: 60px;
          }

          .icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}
