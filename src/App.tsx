/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CloudLightning,
  Sun,
  CloudSun,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  MapPin,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";

import { WeatherData, SearchHistoryItem } from "./types";
import BackgroundManager from "./components/BackgroundManager";
import TemperatureToggle from "./components/TemperatureToggle";
import SearchBar from "./components/SearchBar";
import WindWidget from "./components/WindWidget";
import WeatherCard from "./components/WeatherCard";
import ForecastSection from "./components/ForecastSection";
import LoadingSkeleton from "./components/LoadingSkeleton";

export default function App() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [unit, setUnit] = useState<"C" | "F">(() => {
    const saved = localStorage.getItem("weather_unit");
    return (saved === "C" || saved === "F") ? saved : "C";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Searches History from localStorage
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load favorite bookmarked cities
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("favorite_cities");
      return saved ? JSON.parse(saved) : ["New York", "Tokyo", "London"];
    } catch {
      return ["New York", "Tokyo", "London"];
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("weather_unit", unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("recent_searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem("favorite_cities", JSON.stringify(favorites));
  }, [favorites]);

  // Initial lookup on load
  useEffect(() => {
    // If favorites has items, search the first one; otherwise default to "Tokyo"
    const defaultSearch = favorites.length > 0 ? favorites[0] : "New York";
    searchByCityName(defaultSearch);
  }, []);

  // Primary API Query: City Name
  const searchByCityName = async (city: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get<WeatherData>("/api/weather", {
        params: { city }
      });
      handleSuccessfulFetch(response.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.error ||
        "Failed to reach weather coordinates. Check your server status and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Primary API Query: Coordinates from Geolocation
  const searchByCoordinates = async (lat: number, lon: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get<WeatherData>("/api/weather", {
        params: { lat, lon }
      });
      handleSuccessfulFetch(response.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to retrieve weather reports for your custom location coordinates.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulFetch = (weather: WeatherData) => {
    setData(weather);

    // Save searchable item to recent searches summary (max 5)
    const newItem: SearchHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      city: weather.city,
      temp: weather.temp,
      condition: weather.condition.main,
      timestamp: Date.now()
    };

    setRecentSearches((prev) => {
      // Filter out duplicate cities
      const cleared = prev.filter((item) => item.city.toLowerCase() !== weather.city.toLowerCase());
      return [newItem, ...cleared].slice(0, 5);
    });
  };

  // Bookmark / Favorite toggler
  const toggleFavorite = (cityName: string) => {
    setFavorites((prev) => {
      const lower = cityName.toLowerCase();
      const exists = prev.some(c => c.toLowerCase() === lower);
      if (exists) {
        // Remove
        return prev.filter(c => c.toLowerCase() !== lower);
      } else {
        // Add
        return [...prev, cityName];
      }
    });
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  const isCurrentFavorite = data ? favorites.some(c => c.toLowerCase() === data.city.toLowerCase()) : false;

  return (
    <div className="min-h-screen text-slate-100 font-sans tracking-tight relative overflow-x-hidden p-4 md:p-8">

      {/* Dynamic Animated Particle Backdrops (defaults to Clear if app is loading) */}
      <BackgroundManager condition={data ? data.condition.main : "Clear"} />

      <main className="max-w-7xl mx-auto space-y-6 relative z-10">

        {/* Top Header Row with settings */}
        <header className="glass-card flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <CloudSun className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AeroCast              </h2>
              <div className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span>LOCAL TIME: {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {data && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all text-xs font-semibold uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${data.isSimulated ? "bg-yellow-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
                <span className="text-white/80 font-mono">{data.isSimulated ? "Procedural Demo" : "Live API Stream"}</span>
              </div>
            )}

            <TemperatureToggle unit={unit} onToggle={setUnit} />
          </div>
        </header>

        {/* Favorite Bookmark Quick-Bar */}
        {favorites.length > 0 && (
          <div id="favorites-bar-row" className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono flex-shrink-0 flex items-center gap-1 pl-1">
              <Bookmark className="w-3 h-3 text-sky-400" /> Saved Locations:
            </span>
            <div className="flex gap-2">
              {favorites.map((fav, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => searchByCityName(fav)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-102 hover:bg-white/15 active:scale-98 ${data && data.city.toLowerCase() === fav.toLowerCase()
                    ? "bg-white/20 border-white/30 text-white shadow-md shadow-white/5"
                    : "bg-black/15 border-white/5 text-white/70 hover:text-white"
                    }`}
                >
                  {fav}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Search Field */}
        <section id="search-section">
          <SearchBar
            onSearch={searchByCityName}
            onSearchCoords={searchByCoordinates}
            recentSearches={recentSearches}
            onClearHistory={handleClearHistory}
            onSelectRecent={searchByCityName}
            isLoading={isLoading}
          />
        </section>

        {/* Error Alert Box */}
        {errorMsg && (
          <div
            id="error-msg-overlay"
            className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-100 p-4 rounded-2xl max-w-lg mx-auto shadow-lg animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-bold">Lookup Error:</strong> {errorMsg}
              <button
                type="button"
                className="block text-xs text-red-400 hover:text-red-300 font-mono mt-1 font-bold underline"
                onClick={() => searchByCityName("New York")}
              >
                Reset to default fallback (New York)
              </button>
            </div>
          </div>
        )}

        {/* Main Weather Display */}
        {isLoading ? (
          <section id="rendering-skeleton">
            <LoadingSkeleton />
          </section>
        ) : data ? (
          <section id="weather-dashboard-viewport" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header displaying search title & Bookmark Star badge */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest font-bold">OUTLOOK TODAY FOR</span>
                <span className="text-sm font-extrabold text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/5">{data.city}</span>
              </div>

              <button
                id="toggle-pin-button"
                type="button"
                onClick={() => toggleFavorite(data.city)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isCurrentFavorite
                  ? "bg-sky-400/15 border-sky-400/30 text-sky-300"
                  : "bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
              >
                {isCurrentFavorite ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Location Pinned</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 animate-pulse" />
                    <span>Save Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Weather Cards layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Primary Cards Column (Weather details + mini telemetry) */}
              <div className="lg:col-span-8 space-y-6">
                <WeatherCard data={data} unit={unit} />
              </div>

              {/* Side Wind telemetry column */}
              <div className="lg:col-span-4 h-full">
                <WindWidget wind={data.wind} unit={unit} />
              </div>

            </div>

            {/* Forecast summaries Row (hourly sliders and 5-day columns) */}
            <ForecastSection hourly={data.hourly} forecast={data.forecast} unit={unit} />

          </section>
        ) : (
          <div className="text-center py-20 bg-slate-900/30 backdrop-blur-md rounded-3xl p-8 border border-white/5">
            <RefreshCw className="w-8 h-8 text-white/30 animate-spin mx-auto mb-4" />
            <p className="text-white/60 font-medium">Calibrating weather parameters...</p>
          </div>
        )}

        {/* Footer info pane */}
        <footer className="text-center pt-10 pb-6 text-white/30 text-[10px] font-mono border-t border-white/5 uppercase tracking-widest leading-relaxed">
          <p>AeroCast Premium Weather Console — Styled in High-Contrast Glassmorphism</p>
          <p className="mt-1">Powered by OpenWeather APIs & server-side Google Gemini 3.5 AI Insights</p>
        </footer>

      </main>
    </div>
  );
}
