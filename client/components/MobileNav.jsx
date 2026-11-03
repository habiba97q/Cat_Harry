'use client';
// components/MobileNav.jsx
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

// Mock auth state for demo UI
const isAuthenticated = true;
const userName = 'Jane Doe';
const userAvatar = 'https://i.pravatar.cc/40?img=5';

export default function MobileNav({ open, setOpen }) {
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explore Studios', href: '/studios' },
    { name: 'How It Works', href: '/#how-it-works' },
  ];

  const close = () => setOpen(false);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-base-100 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <span className="font-bold text-lg text-primary">StudioSpace</span>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={close} aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn btn-ghost justify-start"
              onClick={close}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <hr className="border-base-300 mx-4" />

        {/* Auth section */}
        <div className="flex flex-col p-4 space-y-2 flex-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-3 py-2 px-2">
                <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full ring-2 ring-primary" />
                <div>
                  <p className="font-semibold text-sm">{userName}</p>
                  <p className="text-xs text-gray-500">Studio Host</p>
                </div>
              </div>
              <Link href="/add-studio" className="btn btn-primary btn-sm gap-1" onClick={close}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Studio
              </Link>
              <Link href="/dashboard" className="btn btn-ghost justify-start btn-sm" onClick={close}>Dashboard</Link>
              <Link href="/my-listings" className="btn btn-ghost justify-start btn-sm" onClick={close}>My Studio Listings</Link>
              <Link href="/my-bookings" className="btn btn-ghost justify-start btn-sm" onClick={close}>My Bookings</Link>
              <button className="btn btn-outline btn-error btn-sm justify-start">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm" onClick={close}>Login</Link>
              <Link href="/register" className="btn btn-primary btn-sm" onClick={close}>Register</Link>
            </>
          )}
        </div>

        {/* Theme toggle at bottom */}
        <div className="p-4 border-t border-base-300">
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm w-full justify-start gap-2">
            {theme === 'light' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark Mode
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
                </svg>
                Light Mode
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
