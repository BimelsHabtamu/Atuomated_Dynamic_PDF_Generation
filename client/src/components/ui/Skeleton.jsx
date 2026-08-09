export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-2.5 w-32" />
        </div>
        <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
      </div>
      <div className="pt-1 border-t border-gray-50">
        <Skeleton className="h-2.5 w-28" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 6 }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className={`h-4 ${i === 0 ? 'w-36' : i === cols - 1 ? 'w-16' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
