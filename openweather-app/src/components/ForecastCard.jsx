import React from "react";

export const ForecastCard = ({ data, unit }) => {

  const date = new Date(data.dt * 1000);
  
  const day = date.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="bg-red-600 bg-opacity-30 rounded-2xl p-4 text-center shadow-md">
      <p className="font-semibold">{day}</p>
      <img
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt={data.weather[0].description}
        className="mx-auto"
      />
      <p className="font-bold">{Math.round(data.main.temp)}°{unit === "metric" ? "C" : "F"}</p>
      <p className="text-sm">{data.weather[0].main}</p>
    </div>
  );
};
