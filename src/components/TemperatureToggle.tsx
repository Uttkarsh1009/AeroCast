import React from "react";
import { motion } from "motion/react";

interface TemperatureToggleProps {
  unit: "C" | "F";
  onToggle: (unit: "C" | "F") => void;
}

export default function TemperatureToggle({ unit, onToggle }: TemperatureToggleProps) {
  return (
    <div
      id="temp-unit-toggle"
      className="relative flex items-center bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10 select-none shadow-inner w-36 overflow-hidden"
    >
      <div className="absolute inset-0 w-1/2 rounded-full p-1" />
      <button
        id="toggle-btn-c"
        onClick={() => onToggle("C")}
        className={`relative z-10 flex-1 py-1 text-xs font-semibold text-center uppercase tracking-wider transition-colors duration-200 ${
          unit === "C" ? "text-neutral-900" : "text-white/70 hover:text-white"
        }`}
      >
        Celsius
      </button>
      <button
        id="toggle-btn-f"
        onClick={() => onToggle("F")}
        className={`relative z-10 flex-1 py-1 text-xs font-semibold text-center uppercase tracking-wider transition-colors duration-200 ${
          unit === "F" ? "text-neutral-900" : "text-white/70 hover:text-white"
        }`}
      >
        Fahr
      </button>

      {/* Sliding background capsule */}
      <motion.div
        className="absolute top-1 bottom-1 left-1 bg-white rounded-full shadow"
        style={{ width: "calc(50% - 4px)" }}
        animate={{
          x: unit === "C" ? 0 : "100%",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />
    </div>
  );
}
