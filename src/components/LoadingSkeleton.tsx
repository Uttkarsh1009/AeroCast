import React from "react";

export default function LoadingSkeleton() {
  return (
    <div id="loading-skeleton-pulse" className="space-y-8 animate-pulse w-full select-none">
      
      {/* 1. Header & Search Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="h-6 w-48 bg-white/10 dark:bg-black/30 rounded-full" />
        <div className="h-10 w-36 bg-white/10 dark:bg-black/30 rounded-full" />
      </div>

      {/* 2. Main Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main highlight widget */}
        <div className="md:col-span-2 h-72 bg-white/10 dark:bg-black/30 rounded-3xl p-8 flex flex-col justify-between border border-white/5">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-white/10 dark:bg-black/15 rounded-full" />
            <div className="h-4 w-32 bg-white/10 dark:bg-black/15 rounded-full" />
            <div className="flex items-center gap-6 pt-4">
              <div className="w-16 h-16 bg-white/10 dark:bg-black/15 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-12 w-24 bg-white/10 dark:bg-black/15 rounded-2xl" />
                <div className="h-4 w-36 bg-white/10 dark:bg-black/15 rounded-full" />
              </div>
            </div>
          </div>
          <div className="h-6 w-full bg-white/5 dark:bg-black/15 rounded-full" />
        </div>

        {/* Side mini telemetry widget */}
        <div className="h-72 bg-white/10 dark:bg-black/30 rounded-3xl p-6 flex flex-col justify-between border border-white/5">
          <div className="space-y-4">
            <div className="h-6 w-40 bg-white/10 dark:bg-black/15 rounded-full" />
            <div className="h-10 w-24 bg-white/10 dark:bg-black/15 rounded-full" />
          </div>
          <div className="space-y-2 pt-6 border-t border-white/5">
            <div className="h-4 w-full bg-white/5 dark:bg-black/15 rounded-full" />
            <div className="h-4 w-full bg-white/5 dark:bg-black/15 rounded-full" />
            <div className="h-4 w-full bg-white/5 dark:bg-black/15 rounded-full" />
          </div>
        </div>
      </div>

      {/* 3. AI Insights bar skeleton */}
      <div className="h-28 bg-white/10 dark:bg-black/30 rounded-3xl p-6 border border-white/5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-xl" />
          <div className="h-4 w-40 bg-white/10 rounded-full" />
        </div>
        <div className="h-4 w-5/6 bg-white/5 rounded-full" />
      </div>

      {/* 4. Secondary telemetry indicators skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-white/10 dark:bg-black/30 rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
            <div className="h-4 w-16 bg-white/10 rounded-full" />
            <div className="h-8 w-12 bg-white/10 rounded-xl" />
          </div>
        ))}
      </div>

      {/* 5. Forecast & Chart summaries skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-44 bg-white/10 dark:bg-black/30 rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="h-4 w-48 bg-white/10 rounded-full" />
          <div className="flex gap-4 overflow-x-hidden pt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-20 h-24 bg-white/5 dark:bg-black/15 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>

        <div className="h-44 bg-white/10 dark:bg-black/30 rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="h-4 w-40 bg-white/10 rounded-full" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full bg-white/5 rounded-full" />
            <div className="h-4 w-full bg-white/5 rounded-full" />
            <div className="h-4 w-full bg-white/5 rounded-full" />
          </div>
        </div>
      </div>

    </div>
  );
}
