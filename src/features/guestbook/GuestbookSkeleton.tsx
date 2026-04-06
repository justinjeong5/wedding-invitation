export default function GuestbookSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-bg-card p-4 rounded-lg border border-border animate-pulse"
        >
          <div className="flex justify-between mb-2">
            <div className="h-4 w-16 bg-border/50 rounded" />
            <div className="h-3 w-20 bg-border/30 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-full bg-border/40 rounded" />
            <div className="h-3.5 w-2/3 bg-border/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
