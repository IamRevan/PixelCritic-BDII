"use client";

export function GameCardSkeleton() {
  return (
    <div className="game-card rounded-2xl overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-48 w-full bg-surface-container-high"></div>
      <div className="p-md flex-1 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-surface-variant"></div>
          <div className="h-4 w-12 rounded bg-surface-variant"></div>
        </div>
        <div className="h-5 w-3/4 rounded bg-surface-variant"></div>
        <div className="h-3 w-1/2 rounded bg-surface-variant"></div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-4 rounded bg-surface-variant"></div>)}
        </div>
        <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center">
          <div className="h-6 w-16 rounded bg-surface-variant"></div>
          <div className="h-6 w-6 rounded bg-surface-variant"></div>
        </div>
      </div>
    </div>
  );
}

export function PremiumCardSkeleton({ featured = false }) {
  if (featured) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden lg:col-span-2 flex flex-col md:flex-row min-h-[380px] animate-pulse">
        <div className="w-full md:w-3/5 min-h-[220px] md:min-h-full bg-surface-container-high"></div>
        <div className="w-full md:w-2/5 p-lg flex flex-col justify-center gap-4 bg-surface">
          <div className="h-6 w-24 rounded bg-surface-variant"></div>
          <div className="h-8 w-3/4 rounded bg-surface-variant"></div>
          <div className="h-4 w-full rounded bg-surface-variant"></div>
          <div className="h-4 w-2/3 rounded bg-surface-variant"></div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-5 w-5 rounded bg-surface-variant"></div>)}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-8 w-20 rounded bg-surface-variant"></div>
            <div className="h-8 w-24 rounded bg-surface-variant"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[400px] animate-pulse">
      <div className="h-1/2 bg-surface-container-high"></div>
      <div className="h-1/2 p-md bg-surface-container flex flex-col gap-3">
        <div className="h-3 w-16 rounded bg-surface-variant"></div>
        <div className="h-5 w-3/4 rounded bg-surface-variant"></div>
        <div className="h-3 w-full rounded bg-surface-variant"></div>
        <div className="mt-auto">
          <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
            <div className="h-6 w-16 rounded bg-surface-variant"></div>
            <div className="h-6 w-20 rounded bg-surface-variant"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="pt-lg animate-pulse">
      <div className="h-4 w-40 rounded bg-surface-variant mb-lg"></div>
      <div className="glass-panel rounded-2xl overflow-hidden border-primary/20">
        <div className="relative h-48 md:h-64 bg-surface-container-high"></div>
        <div className="p-lg space-y-4">
          <div className="flex gap-3">
            <div className="h-6 w-20 rounded bg-surface-variant"></div>
            <div className="h-6 w-16 rounded bg-surface-variant"></div>
          </div>
          <div className="h-10 w-1/2 rounded bg-surface-variant"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-xl bg-surface-variant"></div>)}
          </div>
          <div className="h-4 w-48 rounded bg-surface-variant"></div>
        </div>
      </div>
    </div>
  );
}
