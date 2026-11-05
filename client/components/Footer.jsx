// components/Footer.jsx
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content pt-10 pb-6 mt-16">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="" width={28} height={28} />
            <span className="font-bold text-lg text-primary">StudioSpace</span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            The peer-to-peer marketplace for creative studios. Book, list, and create with confidence.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-60">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/studios" className="link link-hover">All Studios</Link></li>
            <li><Link href="/studios?category=Photo+Studios" className="link link-hover">Photo Studios</Link></li>
            <li><Link href="/studios?category=Sound+Stages" className="link link-hover">Sound Stages</Link></li>
            <li><Link href="/studios?category=Podcast+Rooms" className="link link-hover">Podcast Rooms</Link></li>
            <li><Link href="/studios?category=Music+Suites" className="link link-hover">Music Suites</Link></li>
            <li><Link href="/studios?category=Art+Workshops" className="link link-hover">Art Workshops</Link></li>
          </ul>
        </div>

        {/* Host */}
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-60">Hosting</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/add-studio" className="link link-hover">List Your Studio</Link></li>
            <li><Link href="/my-listings" className="link link-hover">Manage Listings</Link></li>
            <li><Link href="/dashboard" className="link link-hover">Dashboard</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-60">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="link link-hover">About Us</Link></li>
            <li><Link href="/" className="link link-hover">Contact</Link></li>
            <li><Link href="/about#privacy" className="link link-hover">Privacy Policy</Link></li>
            <li><Link href="/about#terms" className="link link-hover">Terms of Service</Link></li>
            <li><a href="https://x.com" target="_blank" rel="noreferrer" className="link link-hover">Follow on X</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-base-300 mt-8 pt-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} StudioSpace. All rights reserved. Built with ❤️ for creators.
      </div>
    </footer>
  );
}
