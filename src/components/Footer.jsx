export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Branding */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-bold">ClaimReady</span>
            <p className="text-sm text-gray-400">
              Singapore's AI-powered insurance claim execution engine
            </p>
          </div>

          {/* Center: Powered by Agnes AI Badge */}
          <div className="flex items-center gap-2 bg-white bg-opacity-10 rounded-xl px-4 py-2">
            <span className="text-sm font-medium text-gray-300">Powered by</span>
            <div className="bg-white text-navy rounded-lg px-3 py-1 text-sm font-bold">
              Agnes AI
            </div>
          </div>

          {/* Right: Disclaimer */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-400 max-w-md">
              ClaimReady provides guidance only and is not a substitute for licensed financial advice.
              Always consult your insurer or a qualified financial advisor for specific claims.
            </p>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="border-t border-white border-opacity-20 mt-6 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ClaimReady. Built for Singaporeans, by Singaporeans.
          </p>
        </div>
      </div>
    </footer>
  );
}