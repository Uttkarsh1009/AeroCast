import React from "react";
import { Wind, Navigation, Compass } from "lucide-react";
import { WindData } from "../types";

interface WindWidgetProps {
  wind: WindData;
  unit: "C" | "F";
}

export default function WindWidget({ wind, unit }: WindWidgetProps) {
  const speed = wind.speed;
  const rawDeg = wind.deg;
  const gust = wind.gust;

  // Convert m/s to mph if Unit is Fahrenheit
  const displaySpeed = unit === "F" ? (speed * 2.237) : speed;
  const speedUnit = unit === "F" ? "mph" : "m/s";

  const displayGust = gust ? (unit === "F" ? (gust * 2.237) : gust) : null;

  // Rotational animation speed based on wind velocity (lower is faster)
  // Low speed (<3 m/s) -> 12s rotation
  // Med speed (3-8 m/s) -> 5s rotation
  // High speed (>8 m/s) -> 1.5s rotation
  const getRotationDuration = () => {
    if (speed < 0.5) return "0s"; // virtually stationary
    const baseDuration = 18 / Math.max(0.5, speed); // inverse relation
    return `${Math.min(15, Math.max(0.5, baseDuration))}s`;
  };

  // Convert compass degree to cardinal directions
  const getCardinalDirection = (deg: number) => {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return directions[index];
  };

  const durationClass = getRotationDuration();

  return (
    <div
      id="weather-wind-widget"
      className="glass-card p-6 flex flex-col justify-between h-full group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-white/70 tracking-wide uppercase font-mono">
          <Wind className="w-4 h-4 text-sky-300" /> Wind Telemetry
        </span>
        <Compass className="w-4 h-4 text-white/30" />
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        {/* Left column: animated turbine graphic */}
        <div className="flex flex-col items-center justify-center relative h-32">
          {/* Turbine mast */}
          <div className="absolute bottom-2 w-1.5 h-16 bg-gradient-to-t from-white/10 to-white/40 rounded-full" />
          
          {/* Rotating Turbines rotor */}
          <div
            id="wind-turbine-rotor"
            className="absolute top-2 w-20 h-20 flex items-center justify-center pointer-events-none"
            style={{
              animation: speed >= 0.5 ? `spin ${durationClass} linear infinite` : "none"
            }}
          >
            {/* Turbine blade 1 */}
            <div className="absolute top-0 w-2.5 h-10 bg-gradient-to-b from-white/90 to-white/30 rounded-full origin-bottom" style={{ transform: "rotate(0deg)" }} />
            {/* Turbine blade 2 */}
            <div className="absolute top-0 w-2.5 h-10 bg-gradient-to-b from-white/90 to-white/30 rounded-full origin-bottom" style={{ transform: "rotate(120deg)" }} />
            {/* Turbine blade 3 */}
            <div className="absolute top-0 w-2.5 h-10 bg-gradient-to-b from-white/90 to-white/30 rounded-full origin-bottom" style={{ transform: "rotate(240deg)" }} />
            
            {/* Turbine center cap */}
            <div className="absolute w-4 h-4 bg-white border-2 border-slate-900 rounded-full shadow" />
          </div>
        </div>

        {/* Right column: digital numerical readouts */}
        <div className="flex flex-col justify-center text-white space-y-3">
          <div>
            <div className="text-4xl font-black font-sans leading-none tracking-tight">
              {displaySpeed.toFixed(1)}
              <span className="text-lg font-light ml-1 text-white/75">{speedUnit}</span>
            </div>
            <div className="text-xs text-white/50 font-mono mt-0.5">Speed</div>
          </div>

          <div className="flex items-center gap-2 pb-1">
            {/* Rotating arrow indicator according to rawDeg */}
            <div
              id="wind-direction-arrow-wrapper"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 transition-transform duration-500 shadow-md"
              style={{ transform: `rotate(${rawDeg}deg)` }}
            >
              <Navigation className="w-4 h-4 text-sky-300 fill-sky-300" />
            </div>
            <div>
              <div className="text-sm font-bold font-mono">
                {rawDeg}° {getCardinalDirection(rawDeg)}
              </div>
              <div className="text-[10px] text-white/40 font-mono uppercase">Direction</div>
            </div>
          </div>

          {displayGust && (
            <div className="border-t border-white/5 pt-2">
              <span className="text-sm font-bold block text-white/90">
                {displayGust.toFixed(1)} <span className="text-xs font-light">{speedUnit}</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono uppercase">Wind Gusts</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
