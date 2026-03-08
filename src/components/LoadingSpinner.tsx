export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="size-12 animate-spin rounded-full border-4 border-aircalin-light border-t-aircalin-blue" />
      <p className="mt-4 text-gray-600">Chargement des vols...</p>
    </div>
  )
}
