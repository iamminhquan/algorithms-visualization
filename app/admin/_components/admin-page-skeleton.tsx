const SKELETON_CARDS = [0, 1, 2, 3];

export function AdminPageSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="h-4 w-24 rounded bg-bg-subtle" />
        <div className="h-8 w-72 max-w-full rounded-lg bg-bg-subtle" />
        <div className="h-5 w-96 max-w-full rounded bg-bg-subtle" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SKELETON_CARDS.map((card) => (
          <div key={card} className="h-28 rounded-xl bg-bg-subtle" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-xl bg-bg-subtle lg:col-span-2" />
        <div className="h-72 rounded-xl bg-bg-subtle" />
      </div>
    </div>
  );
}
