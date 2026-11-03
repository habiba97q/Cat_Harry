// app/page.jsx
import dynamic from 'next/dynamic';
import Link from 'next/link';
import StudioCard from '../components/StudioCard';

// Dynamically import Swiper-based slider with SSR disabled
const HeroSlider = dynamic(() => import('../components/HeroSlider'), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] min-h-[420px] bg-gradient-to-r from-gray-900 to-blue-900 flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-white"></span>
    </div>
  ),
});

// Category icons mapping
const categoryIcons = {
  'Photo Studios': '📷',
  'Sound Stages': '🎬',
  'Podcast Rooms': '🎙️',
  'Music Suites': '🎵',
  'Art Workshops': '🎨',
};

// Step definitions for the "How Booking Works" section
const steps = [
  { number: '01', title: 'Find Your Studio', desc: 'Browse by category, location, or availability to discover the perfect space.' },
  { number: '02', title: 'Check Availability', desc: 'View real‑time calendar slots, pricing, and read verified host reviews.' },
  { number: '03', title: 'Book Instantly', desc: 'Reserve your slot in seconds with secure payment and instant confirmation.' },
  { number: '04', title: 'Create & Collaborate', desc: 'Show up and create. StudioSpace handles everything else.' },
];

// Guarantees displayed in the "Host Guarantee" section
const guaranteeItems = [
  { icon: '✅', title: 'Verified Listings', desc: 'Every studio is manually reviewed before going live.' },
  { icon: '🛡️', title: 'Secure Payments', desc: 'All transactions are encrypted and protected.' },
  { icon: '🕐', title: '24/7 Support', desc: 'Our team is always on standby for hosts and creators alike.' },
  { icon: '💰', title: 'Best Price Guarantee', desc: 'We match any lower rate for the same studio.' },
];

export const metadata = {
  title: 'StudioSpace — Creative Studio Booking Platform',
  description: 'Discover and book photography studios, sound stages, podcast rooms, music suites, and art workshops near you.',
};

export default async function HomePage() {
  // Fetch featured studios (first 6) from backend
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
  let featured = [];
  try {
    const res = await fetch(`${SERVER_URL}/api/studios`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      featured = (data.studios || data).slice(0, 6);
    }
  } catch {
    // Backend not running — render page without featured studios
  }

  return (
    <div className="-mx-4 -mt-6">
      {/* Hero Slider (client‑only) */}
      <HeroSlider />

      <div className="px-4 md:px-8 lg:px-16 space-y-20 py-16">
        {/* Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'Studios Listed' },
            { value: '12K+', label: 'Bookings Made' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '50+', label: 'Cities Covered' },
          ].map((stat) => (
            <div key={stat.label} className="bg-base-200 rounded-2xl p-6">
              <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Browse by Categories */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-gray-500">Find the perfect creative space for your next project</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.keys(categoryIcons).map((cat) => (
              <Link
                key={cat}
                href={`/studios?category=${encodeURIComponent(cat)}`}
                className="bg-base-200 hover:bg-primary hover:text-white rounded-2xl p-6 text-center transition-all duration-300 group card-hover"
              >
                <div className="text-4xl mb-3">{categoryIcons[cat]}</div>
                <p className="font-semibold text-sm">{cat}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Studios */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Studios</h2>
              <p className="text-gray-500 mt-1">Hand‑picked top‑rated creative spaces</p>
            </div>
            <Link href="/studios" className="btn btn-outline btn-primary">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((studio) => (
              <StudioCard
                key={studio._id}
                studio={{
                  id: studio._id,
                  name: studio.title,
                  category: studio.category,
                  thumbnail: studio.image,
                  price: studio.hourlyRate,
                  rating: studio.rating || 0,
                  reviews: studio.reviewsCount || 0,
                  location: studio.address,
                }}
              />
            ))}
          </div>
        </section>

        {/* How Booking Works */}
        <section id="how-it-works" className="bg-base-200 rounded-3xl p-8 md:p-14">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How Booking Works</h2>
            <p className="text-gray-500">From discovery to creation in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg">
                  {step.number}
                </div>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/studios" className="btn btn-primary btn-lg">Start Exploring Studios</Link>
          </div>
        </section>

        {/* Host Guarantee */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">The StudioSpace Guarantee</h2>
            <p className="text-gray-500">We've got you covered, every step of the way</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guaranteeItems.map((item) => (
              <div key={item.title} className="card bg-base-200 p-6 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
                <span className="text-4xl">{item.icon}</span>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-purple-600" />
          <div className="relative z-10 py-16 px-8 md:px-16 text-white text-center">
            <h2 className="text-4xl font-extrabold mb-4">Own a Creative Space?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">
              Join hundreds of studio owners earning passive income by sharing their space with talented creators.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/add-studio" className="btn btn-white text-primary btn-lg font-bold bg-white hover:bg-gray-100">
                List Your Studio — It's Free
              </Link>
              <Link href="/studios" className="btn btn-outline text-white border-white btn-lg hover:bg-white hover:text-primary">
                Browse Studios
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
