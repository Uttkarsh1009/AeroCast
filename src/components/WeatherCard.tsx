import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Activity,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Zap,
  CloudLightning,
  Sparkles,
  Award
} from "lucide-react";
import { WeatherData } from "../types";

interface WeatherCardProps {
  data: WeatherData;
  unit: "C" | "F";
}

// Convert Celsius to Fahrenheit
const toF = (c: number) => Math.round((c * 9) / 5 + 32);

export default function WeatherCard({ data, unit }: WeatherCardProps) {
  const {
    city,
    country,
    temp,
    feelsLike,
    humidity,
    pressure,
    visibility,
    sunrise,
    sunset,
    condition,
    aqi,
    uvIndex,
    aiInsight,
    isSimulated
  } = data;

  // State to handle animated temperature incrementation on load/search
  const [animatedTemp, setAnimatedTemp] = useState(temp);

  useEffect(() => {
    let startVal = animatedTemp;
    const endVal = temp;
    if (startVal === endVal) return;

    const diff = endVal - startVal;
    const step = diff > 0 ? 1 : -1;
    const speed = Math.max(20, Math.floor(400 / Math.abs(diff)));

    const interval = setInterval(() => {
      startVal += step;
      setAnimatedTemp(startVal);
      if (startVal === endVal) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [temp]);

  // Display value calculations
  const displayTemp = unit === "F" ? toF(animatedTemp) : Math.round(animatedTemp);
  const displayFeelsLike = unit === "F" ? toF(feelsLike) : Math.round(feelsLike);
  const displayMin = unit === "F" ? toF(data.tempMin) : Math.round(data.tempMin);
  const displayMax = unit === "F" ? toF(data.tempMax) : Math.round(data.tempMax);

  // Time format calculations (Sunrise/Sunset)
  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 is 12
    return `${hours}:${minutes} ${ampm}`;
  };

  // Convert visibility meters to km or miles
  const displayVisibility = () => {
    if (unit === "F") {
      const miles = (visibility / 1609.34).toFixed(1);
      return `${miles} mi`;
    } else {
      const km = (visibility / 1000).toFixed(1);
      return `${km} km`;
    }
  };

  // Weather condition-specific React components
  const getWeatherIcon = (mainCond: string) => {
    const size = "w-16 h-16";
    switch (mainCond) {
      case "Clear":
        return <Sun className={`${size} text-yellow-300 animate-[spin_20s_linear_infinite]`} />;
      case "Clouds":
        return <Cloud className={`${size} text-slate-300 animate-pulse`} />;
      case "Rain":
      case "Drizzle":
        return <CloudRain className={`${size} text-sky-400 animate-bounce`} />;
      case "Snow":
        return <Snowflake className={`${size} text-blue-200 animate-[spin_10s_linear_infinite]`} />;
      case "Thunderstorm":
        return <CloudLightning className={`${size} text-amber-400 animate-bounce`} />;
      default:
        return <Cloud className={`${size} text-slate-300`} />;
    }
  };

  // AQI label selector
  const getAqiDescription = (val: number) => {
    switch (val) {
      case 1: return { text: "Good", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case 2: return { text: "Fair", color: "text-green-400 bg-green-500/10 border-green-500/20" };
      case 3: return { text: "Moderate", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
      case 4: return { text: "Poor", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
      case 5: return { text: "Very Poor", color: "text-red-400 bg-red-500/10 border-red-500/20" };
      default: return { text: "No Data", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
    }
  };

  const aqiBadge = aqi ? getAqiDescription(aqi.aqi) : null;

  return (
    <div id="weather-details-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Primary Highlight Card */}
      <div
        id="main-weather-card"
        className="glass-card md:col-span-2 p-8 relative overflow-hidden flex flex-col justify-between group"
      >
        {isSimulated && (
          <div className="absolute top-4 right-4 bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider font-mono">
            Demo Mode
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h1 id="city-name-header" className="text-3xl font-black text-white tracking-tight flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300 leading-tight">
              {city} <span className="text-xl font-normal text-white/60 font-mono">{country}</span>
            </h1>
            <p className="text-xs text-white/50 font-mono mt-1 font-semibold uppercase tracking-wider">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-6 py-4">
            {getWeatherIcon(condition.main)}
            <div>
              <div className="relative inline-block">
                <span id="numeric-temp-display" className="text-7xl font-extrabold text-white tracking-tighter leading-none select-none font-sans">
                  {displayTemp}
                </span>
                <span className="text-3xl font-light text-white/80 absolute -top-1 -right-7">°{unit}</span>
              </div>
              <p className="text-sm font-semibold capitalize text-white/80 tracking-wide mt-1">
                {condition.description}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 flex gap-6 text-white/70 text-xs font-mono">
          <span>High: <strong className="text-white font-sans text-sm">{displayMax}°</strong></span>
          <span>Low: <strong className="text-white font-sans text-sm">{displayMin}°</strong></span>
          <span>Feels Like: <strong className="text-white font-sans text-sm">{displayFeelsLike}°</strong></span>
        </div>
      </div>

      {/* 2. Air Quality Widget */}
      {aqi && aqiBadge && (
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-white/70 tracking-wide uppercase font-mono">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Air Pollution
            </span>
            
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-white">{aqi.aqi}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${aqiBadge.color}`}>
                {aqiBadge.text}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-3 border-t border-white/5 text-white">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/40">PM2.5:</span>
              <span className="font-semibold">{aqi.pm25} µg/m³</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/40">PM10:</span>
              <span className="font-semibold">{aqi.pm10} µg/m³</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/40">NO₂:</span>
              <span className="font-semibold">{aqi.no2} ppb</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/40">O₃:</span>
              <span className="font-semibold">{aqi.o3} ppb</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Gemini AI Smart Insight Card (Only rendered when insight is available) */}
      {aiInsight && (
        <div
          id="ai-insight-card"
          className="glass-card md:col-span-3 p-6 relative overflow-hidden bg-gradient-to-tr from-indigo-500/10 via-sky-500/5 to-purple-500/10"
        >
          {/* Glowing particle effect to symbolize AI intelligence */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 shadow">
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs font-bold text-white/50 tracking-wider uppercase font-mono">AI WEATHER REPORT</span>
              <h3 className="text-xs font-black text-indigo-200 mt-0.5 tracking-tight">Personalized Lifestyle Insights</h3>
            </div>
          </div>

          <p className="text-white/95 text-[15px] font-sans leading-relaxed tracking-wide italic">
            "{aiInsight}"
          </p>
        </div>
      )}

      {/* 4. Secondary Telemetry Grid / Bento Elements */}
      <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
        
        {/* Felt Temp */}
        <div className="glass-card p-5 flex flex-col justify-between text-white">
          <span className="flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase tracking-wider font-semibold">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Feels Like
          </span>
          <div className="mt-4">
            <span className="text-3xl font-extrabold">{displayFeelsLike}°</span>
            <span className="text-xs text-white/40 block mt-1">Similar to screen reading</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="glass-card p-5 flex flex-col justify-between text-white">
          <span className="flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase tracking-wider font-semibold">
            <Droplets className="w-3.5 h-3.5 text-sky-400" /> Humidity
          </span>
          <div className="mt-4">
            <span className="text-3xl font-extrabold">{humidity}%</span>
            <span className="text-xs text-white/40 block mt-1">Dampness coefficient</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="glass-card p-5 flex flex-col justify-between text-white">
          <span className="flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase tracking-wider font-semibold">
            <Eye className="w-3.5 h-3.5 text-emerald-400" /> Visibility
          </span>
          <div className="mt-4">
            <span className="text-3xl font-extrabold">{displayVisibility()}</span>
            <span className="text-xs text-white/40 block mt-1">Active clearance horizon</span>
          </div>
        </div>

        {/* Pressure */}
        <div className="glass-card p-5 flex flex-col justify-between text-white">
          <span className="flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase tracking-wider font-semibold">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" /> Pressure
          </span>
          <div className="mt-4">
            <span className="text-3xl font-extrabold">{pressure} <span className="text-xs font-light">hPa</span></span>
            <span className="text-xs text-white/40 block mt-1">Barometer loading</span>
          </div>
        </div>

        {/* Solar UV */}
        <div className="glass-card p-5 col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col justify-between text-white">
          <span className="flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase tracking-wider font-semibold">
            <Sun className="w-3.5 h-3.5 text-yellow-400 animate-spin-slow" /> Solar UV
          </span>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{uvIndex ?? "—"}</span>
              <span className="text-xs text-amber-300 font-bold font-mono">
                {uvIndex !== undefined ? (uvIndex <= 2 ? "Low" : uvIndex <= 5 ? "Mod" : uvIndex <= 7 ? "High" : "Extreme") : ""}
              </span>
            </div>
            <span className="text-xs text-white/40 block mt-1">Sunscreen recommendations</span>
          </div>
        </div>

        {/* Sunrise / Sunset */}
        <div className="glass-card col-span-2 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
              <Sunrise className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 font-mono uppercase block">Sunrise</span>
              <span className="text-sm font-bold font-mono">{formatTime(sunrise)}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] text-white/40 font-mono uppercase block">Sunset</span>
              <span className="text-sm font-bold font-mono">{formatTime(sunset)}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
              <Sunset className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
