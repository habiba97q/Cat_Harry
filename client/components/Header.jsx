"use client";

import Link from 'next/link';
import { useState, useContext } from 'react';
import { useTheme } from './ThemeProvider';
import MobileNav from './MobileNav';
import Image from 'next/image';
import { AuthContext } from '../src/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;
  const userName = user?.name || '';
  const userAvatar = user?.photoURL;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explore Studios', href: '/studios' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'About Us', href: '/about' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Unable to log out', error);
    }
  };

  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4">
      {/* Logo */}
      <div className="flex-1 flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="StudioSpace" width={36} height={36} priority />
          <span className="font-extrabold text-xl text-primary tracking-tight">StudioSpace</span>
        </Link>
      </div>

      {/* Desktop Nav */}
      <div className="flex-none hidden lg:flex items-center space-x-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`btn btn-sm text-sm font-medium ${pathname === link.href || (link.href === '/studios' && pathname.startsWith('/studios')) ? 'btn-primary' : 'btn-ghost'}`}
            aria-current={pathname === link.href || (link.href === '/studios' && pathname.startsWith('/studios')) ? 'page' : undefined}
          >
            {link.name}
          </Link>
        ))}

        {isAuthenticated ? (
          <>
            {user.role === 'host' && <Link href="/add-studio" className="btn btn-primary btn-sm ml-2 gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Studio
            </Link>}
            {/* Avatar dropdown */}
            <div className="dropdown dropdown-end ml-2">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-9 rounded-full overflow-hidden ring-2 ring-primary ring-offset-1 flex items-center justify-center bg-primary/10 text-primary">
                  {userAvatar ? <Image src={userAvatar} alt="" width={36} height={36} className="w-full h-full object-cover" /> : <span>{userName.slice(0, 1)}</span>}
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
                <li className="menu-title px-4 py-2 font-semibold text-primary">{userName}</li>
                <li><Link href="/dashboard">Dashboard</Link></li>
                {user.role === 'host' && <li><Link href="/add-studio">Add New Studio</Link></li>}
                {user.role === 'host'
                  ? <li><Link href="/my-listings">My Studio Listings</Link></li>
                  : <li><Link href="/my-bookings">My Bookings</Link></li>}
                <li><hr className="my-1 border-base-300" /></li>
                <li><button className="text-error font-medium" onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost btn-sm ml-2">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm ml-1">Register</Link>
          </>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle btn-sm ml-1"
          aria-label="Toggle theme"
          title={theme === 'mytheme' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'mytheme' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile hamburger */}
      <div className="lg:hidden flex items-center">
        <button
          onClick={() => setMobileOpen(true)}
          className="btn btn-ghost btn-circle"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <MobileNav open={mobileOpen} setOpen={setMobileOpen} onLogout={handleLogout} />
      </div>
    </header>
  );
}
