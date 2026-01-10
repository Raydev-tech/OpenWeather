import React from "react";
import { WiHumidity, WiStrongWind } from "react-icons/wi";

export const WeatherCard = ({ data, unit }) => {
  return (
    <div className="bg-red-600 bg-opacity-40 rounded-2xl p-6 w-full max-w-md shadow-lg text-center">
      <h2 className="text-3xl font-bold mb-2">{data.name}, {data.sys.country}</h2>
      <img
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt={data.weather[0].description}
        className="mx-auto"
      />
      <p className="text-xl mb-2 font-semibold">{data.weather[0].main}</p>
      <p className="text-4xl font-bold mb-4">
        {Math.round(data.main.temp)}°{unit === "metric" ? "C" : "F"}
      </p>
      <div className="flex justify-around text-sm">
        <p className="flex items-center gap-1">
          <WiHumidity size={24} /> {data.main.humidity}%
        </p>
        <p className="flex items-center gap-1">
          <WiStrongWind size={24} /> {data.wind.speed} {unit === "metric" ? "m/s" : "mph"}
        </p>
      </div>
    </div>
  );
};
