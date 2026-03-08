export function Header() {
  return (
    <header className="bg-aircalin-blue text-white shadow-lg">
      <div className="container-app py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
            <svg
              className="size-6"
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
          <div>
            <h1 className="text-xl font-bold">Vols Nouméa - La Tontouta</h1>
            <p className="text-sm text-white/80">Tous les vols au départ et à l'arrivée</p>
          </div>
        </div>
      </div>
    </header>
  )
}
