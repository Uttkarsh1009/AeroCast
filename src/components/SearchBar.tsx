import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Trash2, History, X } from "lucide-react";
import { SearchHistoryItem } from "../types";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onSearchCoords: (lat: number, lon: number) => void;
  recentSearches: SearchHistoryItem[];
  onClearHistory: () => void;
  onSelectRecent: (city: string) => void;
  isLoading: boolean;
}

export default function SearchBar({
  onSearch,
  onSearchCoords,
  recentSearches,
  onClearHistory,
  onSelectRecent,
  isLoading
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
    setIsOpen(false);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    // Smooth loader signal
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSearchCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Geolocation fetch error:", error);
        alert(`Could not acquire location: ${error.message}. Searching default instead!`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div id="weather-search-container" className="relative w-full max-w-lg mx-auto z-40" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <input
            id="search-city-input"
            type="text"
            className="w-full pl-11 pr-10 py-3 rounded-full bg-white/5 backdrop-blur-[12px] border border-white/10 focus:border-white/25 text-white text-base placeholder-white/50 shadow-xl focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-300"
            placeholder="Search any city (e.g., Tokyo, London, Paris)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          id="geo-search-button"
          type="button"
          onClick={handleGetCurrentLocation}
          title="Detect Current Location"
          className="flex items-center justify-center p-3 rounded-full bg-white/5 backdrop-blur-[12px] border border-white/10 hover:bg-white/10 hover:border-white/15 active:scale-95 text-white font-medium transition-all duration-200 shadow-xl"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </form>

      {/* Recent searches drop-down dashboard */}
      {isOpen && recentSearches.length > 0 && (
        <div
          id="recent-searches-dropdown"
          className="absolute left-0 right-0 mt-2 glass-card p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-white/40">
            <span className="flex items-center gap-1.5 font-mono">
              <History className="w-3.5 h-3.5" /> Recent History
            </span>
            <button
              type="button"
              onClick={() => {
                onClearHistory();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {recentSearches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectRecent(item.city);
                  setQuery(item.city);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all text-left"
              >
                <span className="font-medium">{item.city}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs opacity-75">{item.condition}</span>
                  <span className="font-bold">{item.temp}°</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
