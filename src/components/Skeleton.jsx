export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-gray-100 dark:border-gray-800 mb-2">
        {[40, 20, 20, 20].map((w, i) => (
          <div key={i} className={`h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`}
            style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-50 dark:border-gray-800/40 last:border-0">
          <div className="flex items-center gap-3 w-[40%]">
            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/4" />
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-1/2" />
            </div>
          </div>
          {[20, 20, 20].map((w, j) => (
            <div key={j} className="flex items-center justify-center" style={{ width: `${w}%` }}>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mb-4" />
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="card space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800/40 last:border-0 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full w-1/4" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card animate-pulse">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mb-4" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  const widths = ['w-full', 'w-4/5', 'w-3/5', 'w-2/3', 'w-3/4'];
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i}
          className={`h-3 bg-gray-200 dark:bg-gray-700 rounded-full ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}