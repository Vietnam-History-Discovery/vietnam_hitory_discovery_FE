function CardSkeleton() {
  return <div className="h-40 bg-surface2 rounded-xl animate-pulse" />
}

export function ArticleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ArticleDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-24 bg-surface2 rounded" />
      <div className="h-9 w-3/4 bg-surface2 rounded" />
      <div className="flex gap-4">
        <div className="h-4 w-20 bg-surface2 rounded" />
        <div className="h-4 w-20 bg-surface2 rounded" />
      </div>
      <div className="space-y-3 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-surface2 rounded"
            style={{ width: `${90 - (i % 4) * 15}%` }}
          />
        ))}
      </div>
    </div>
  )
}
