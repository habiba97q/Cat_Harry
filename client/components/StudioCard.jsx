// components/StudioCard.jsx
import Link from 'next/link';
import Image from 'next/image';

const categoryIcons = {
  'Photo Studios': '📷',
  'Sound Stages': '🎬',
  'Podcast Rooms': '🎙️',
  'Music Suites': '🎵',
  'Art Workshops': '🎨',
};

export default function StudioCard({ studio }) {
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden border border-base-200">
      <figure className="relative h-48">
        <Image
          src={studio.thumbnail}
          alt={studio.name}
          fill
          className="object-cover"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-primary text-xs font-semibold shadow-md">
            {categoryIcons[studio.category] || '🎭'} {studio.category}
          </span>
        </div>
        {/* Rating badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full font-semibold">
            ★ {studio.rating}
          </span>
        </div>
      </figure>

      <div className="card-body p-4 space-y-2">
        <h2 className="card-title text-base font-bold truncate">{studio.name}</h2>
        {studio.location && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>📍</span> {studio.location}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-primary font-extrabold text-lg">${studio.price}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
          <span className="text-xs text-gray-400">({studio.reviews} reviews)</span>
        </div>
        <Link
          href={`/studios/${studio.id}`}
          className="btn btn-primary btn-sm w-full mt-1 font-semibold"
        >
          View Studio →
        </Link>
      </div>
    </div>
  );
}
