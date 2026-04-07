import { Skeleton } from '@components/ui/skeleton'

export function LoadingScreen() {
  return (
    <div className="app-shell flex min-h-screen flex-col bg-background">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="mb-4 h-36 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
