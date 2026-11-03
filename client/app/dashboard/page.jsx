"use client";
import Link from 'next/link';
import { useDashboard } from '../../src/hooks/useDashboard';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded bg-base-200 h-6 w-48"></div>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load dashboard');
    return <div className="p-8 text-red-500">Error loading dashboard.</div>;
  }

  const stats = [
    { label: 'Active Listings', value: data?.stats?.totalListings ?? 0, icon: '🏠', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Bookings', value: data?.stats?.Total ?? 0, icon: '📅', color: 'bg-green-50 text-green-600' },
    { label: 'Total Earnings', value: `$${data?.totalEarnings ?? 0}`, icon: '💰', color: 'bg-purple-50 text-purple-600' },
    { label: 'Avg. Rating', value: data?.averageRating ?? 'N/A', icon: '⭐', color: 'bg-yellow-50 text-yellow-600' },
  ];

  const recentBookings = data?.recentBookings ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back{data?.user?.name ? `, ${data.user.name}` : ''} 👋</h1>
          <p className="text-gray-500 mt-1">Here's an overview of your StudioSpace activity.</p>
        </div>
        <Link href="/add-studio" className="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Studio
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-base-100 border border-base-300 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className={`text-3xl mb-3 w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5">Recent Bookings</h2>
        <div className="space-y-4">
          {recentBookings.map((b) => (
            <div key={b._id} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📅</span>
              <div>
                <p className="text-sm leading-snug">{b.studioId.title} on {new Date(b.bookingDate).toLocaleDateString()}</p>
                <p className="text-xs text-gray-400 mt-1">Status: {b.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-base-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/add-studio" className="btn btn-primary">+ List New Studio</Link>
          <Link href="/my-listings" className="btn btn-outline">Manage Listings</Link>
          <Link href="/my-bookings" className="btn btn-outline">View Bookings</Link>
          <Link href="/studios" className="btn btn-ghost">Browse Studios</Link>
        </div>
      </div>
    </div>
  );
}

