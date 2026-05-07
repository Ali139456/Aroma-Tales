export default function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div
        className="h-9 w-9 rounded-full border-2 border-dark/15 border-t-dark animate-spin"
        aria-hidden
      />
    </div>
  )
}
