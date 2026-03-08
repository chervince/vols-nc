interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white py-12 text-center shadow-sm">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
        <svg
          className="size-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        Erreur de chargement
      </h3>
      <p className="mt-1 max-w-sm text-gray-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-aircalin-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-aircalin-dark"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}
