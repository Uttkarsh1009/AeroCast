import React from "react";
import { Calendar, Clock, CloudRain, Sun, Cloud, Snowflake, Zap, CloudLightning } from "lucide-react";
import { DailyForecast, HourlyForecast } from "../types";

interface ForecastSectionProps {
  hourly: HourlyForecast[];
  forecast: DailyForecast[];
  unit: "C" | "F";
}

// Temperature converter
const toF = (c: number) => Math.round((c * 9) / 5 + 32);

export default function ForecastSection({ hourly, forecast, unit }: ForecastSectionProps) {
  
  const displayVal = (tempC: number) => {
    return unit === "F" ? toF(tempC) : Math.round(tempC);
  };

  // Weather icon picker
  const getWeatherIcon = (mainCond: string) => {
    const size = "w-6 h-6";
    switch (mainCond) {
      case "Clear":
        return <Sun className={`${size} text-yellow-300 animate-[spin_30s_linear_infinite]`} />;
      case "Clouds":
        return <Cloud className={`${size} text-slate-300`} />;
      case "Rain":
      case "Drizzle":
        return <CloudRain className={`${size} text-sky-400`} />;
      case "Snow":
        return <Snowflake className={`${size} text-blue-200`} />;
      case "Thunderstorm":
        return <CloudLightning className={`${size} text-amber-400`} />;
      default:
        return <Cloud className={`${size} text-slate-300`} />;
    }
  };

  // Find overall min and max within the 5-day forecast to render comparative visual range bars (like Apple Weather!)
  const temps = forecast.map(f => [f.tempMin, f.tempMax]).flat();
  const absoluteMin = Math.min(...(temps.length ? temps : [0]));
  const absoluteMax = Math.max(...(temps.length ? temps : [40]));
  const absoluteRange = Math.max(1, absoluteMax - absoluteMin);

  return (
    <div id="forecast-combined-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Hourly Forecast Slider / Bubbles */}
      <div
        id="hourly-forecast-chart"
        className="glass-card lg:col-span-2 p-6 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-white/70 tracking-wide uppercase font-mono">
            <Clock className="w-4 h-4 text-sky-300" /> Hourly Forecast Map
          </span>
          <span className="text-[10px] text-white/40 font-mono tracking-wider font-semibold uppercase">NEXT 24 HOURS</span>
        </div>

        {/* Horizontal scroll view of hourly weather */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
          {hourly.map((hour, idx) => (
            <div
              key={idx}
              className="glass-card flex-shrink-0 flex flex-col items-center justify-between py-4 px-5 w-24 h-36 group"
            >
              <span className="text-xs text-white/60 font-mono tracking-wider">{hour.time}</span>
              <div className="my-2 transform group-hover:scale-110 transition-transform duration-200">
                {getWeatherIcon(hour.condition)}
              </div>
              <div className="text-center">
                <span className="text-sm font-extrabold text-white">{displayVal(hour.temp)}°</span>
                <span className="text-[9px] text-white/40 font-mono uppercase block mt-0.5 leading-none">{hour.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 5-Day Forecast List with Aligned range indicators */}
      <div
        id="weekly-5-day-calendar"
        className="glass-card p-6 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-white/70 tracking-wide uppercase font-mono">
            <Calendar className="w-4 h-4 text-sky-300" /> 5-Day Calendar
          </span>
          <span className="text-[10px] text-white/40 font-mono tracking-wider font-semibold uppercase">Outlook</span>
        </div>

        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {forecast.map((day, idx) => {
            // Calculate coordinates for comparative range bar
            const minPct = ((day.tempMin - absoluteMin) / absoluteRange) * 100;
            const maxPct = ((day.tempMax - absoluteMin) / absoluteRange) * 100;

            return (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center hover:bg-white/5 p-2 rounded-xl border border-transparent hover:border-white/5 transition-all duration-200"
              >
                {/* Weekday name */}
                <div className="col-span-3 text-sm font-bold text-white tracking-tight">
                  {day.date}
                </div>

                {/* Condition Icon */}
                <div className="col-span-2 flex items-center justify-center">
                  {getWeatherIcon(day.condition)}
                </div>

                {/* Humidity value */}
                <div className="col-span-2 text-center text-[10px] font-mono text-sky-300">
                  {day.humidity > 20 && (
                    <span className="flex items-center justify-center gap-0.5">
                      <CloudRain className="w-2.5 h-2.5" />
                      {day.humidity}%
                    </span>
                  )}
                </div>

                {/* Temperature bar details resembling iOS weather style */}
                <div className="col-span-5 flex items-center gap-3 text-xs text-white font-mono justify-end">
                  <span className="opacity-60">{displayVal(day.tempMin)}°</span>
                  
                  {/* Apple-style color spectrum range bar */}
                  <div className="relative flex-1 h-2 bg-white/10 rounded-full overflow-hidden select-none">
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-sky-400 to-amber-300 rounded-full"
                      style={{
                        left: `${minPct}%`,
                        right: `${100 - maxPct}%`
                      }}
                    />
                  </div>

                  <span className="font-extrabold">{displayVal(day.tempMax)}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
