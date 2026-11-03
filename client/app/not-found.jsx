// app/not-found.jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-lg">
        {/* Animated 404 */}
        <div className="relative">
          <p className="text-[10rem] md:text-[12rem] font-extrabold text-primary/10 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-bounce">🎬</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold">Page Not Found</h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Looks like this studio doesn't exist yet — or it moved locations.
            Let's get you back on set.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn btn-primary btn-lg">
            🏠 Back to Home
          </Link>
          <Link href="/studios" className="btn btn-outline btn-lg">
            🔍 Explore Studios
          </Link>
        </div>
      </div>
    </div>
  );
}
