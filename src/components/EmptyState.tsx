export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white py-12 text-center shadow-sm">
      <div className="flex size-16 items-center justify-center rounded-full bg-aircalin-light">
        <svg
          className="size-8 text-aircalin-blue"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        Aucun vol Aircalin
      </h3>
      <p className="mt-1 text-gray-500">
        Aucun vol trouvé pour cette date et ces filtres.
      </p>
    </div>
  )
}
