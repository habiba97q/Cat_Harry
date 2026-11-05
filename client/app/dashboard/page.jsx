"use client";
import { useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../src/context/AuthContext';
import { useDashboard } from '../../src/hooks/useDashboard';
import { api } from '../../src/utils/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const { data, setData, loading, error, retry } = useDashboard(user);
  const isHost = user?.role === 'host';

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const updateBooking = async (bookingId, action) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/${action}`);
      setData((current) => ({
        ...current,
        recentBookings: current.recentBookings.map((booking) =>
          booking._id === bookingId ? { ...booking, status: response.data.status } : booking
        ),
        stats: (() => {
          const previousStatus = current.recentBookings.find((booking) => booking._id === bookingId)?.status;
          return {
            ...current.stats,
            [previousStatus]: Math.max(0, (current.stats[previousStatus] || 0) - 1),
            [response.data.status]: (current.stats[response.data.status] || 0) + 1,
          };
        })(),
        totalBookingValue: action === 'confirm'
          ? current.totalBookingValue + response.data.totalPrice
          : current.totalBookingValue,
      }));
      toast.success(action === 'confirm' ? 'Booking confirmed' : 'Booking cancelled');
    } catch (err) {
      toast.error(err.message || 'Unable to update booking');
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="p-8">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded bg-base-200 h-6 w-48"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-error">Error loading dashboard: {error.message}</p>
        <button className="btn btn-primary" onClick={retry}>Try again</button>
      </div>
    );
  }

  const stats = isHost
    ? [
      { label: 'Studio Listings', value: data?.totalListings ?? 0, icon: '🏠', color: 'bg-blue-50 text-blue-600' },
      { label: 'Total Bookings', value: data?.stats?.Total ?? 0, icon: '📅', color: 'bg-green-50 text-green-600' },
      { label: 'Pending Requests', value: data?.stats?.Pending ?? 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
      { label: 'Booking Value', value: `$${(data?.totalBookingValue ?? 0).toFixed(2)}`, icon: '💰', color: 'bg-purple-50 text-purple-600' },
    ]
    : [
      { label: 'Total Bookings', value: data?.stats?.Total ?? 0, icon: '📅', color: 'bg-blue-50 text-blue-600' },
      { label: 'Pending', value: data?.stats?.Pending ?? 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
      { label: 'Confirmed', value: data?.stats?.Confirmed ?? 0, icon: '✅', color: 'bg-green-50 text-green-600' },
      { label: 'Completed', value: data?.stats?.Completed ?? 0, icon: '🎬', color: 'bg-purple-50 text-purple-600' },
    ];

  const recentBookings = data?.recentBookings ?? [];
  const canComplete = (booking) => {
    const [year, month, day] = new Date(booking.bookingDate).toISOString().slice(0, 10).split('-').map(Number);
    const [hour, minute] = booking.endTime.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour, minute)) <= new Date();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back{data?.user?.name ? `, ${data.user.name}` : ''} 👋</h1>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your StudioSpace activity.</p>
        </div>
        {isHost && <Link href="/add-studio" className="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Studio
        </Link>}
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
          {recentBookings.length === 0 && <p className="text-sm text-gray-500">No bookings yet.</p>}
          {recentBookings.map((b) => (
            <div key={b._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-3 last:border-0">
              <span className="text-xl mt-0.5">📅</span>
              <div className="flex-1">
                <p className="text-sm leading-snug">{b.studioId?.title || 'Studio'} · {new Date(b.bookingDate).toLocaleDateString()}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isHost ? `Requested by ${b.userId?.name || 'Customer'} · ` : ''}Status: {b.status}
                </p>
              </div>
              {isHost && b.status === 'Pending' && (
                <div className="flex gap-2">
                  <button className="btn btn-success btn-sm" onClick={() => updateBooking(b._id, 'confirm')}>Confirm</button>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => updateBooking(b._id, 'cancel')}>Decline</button>
                </div>
              )}
              {isHost && b.status === 'Confirmed' && canComplete(b) && (
                <button className="btn btn-outline btn-sm" onClick={() => updateBooking(b._id, 'complete')}>Mark complete</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-base-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isHost && <Link href="/add-studio" className="btn btn-primary">+ List New Studio</Link>}
          {isHost && <Link href="/my-listings" className="btn btn-outline">Manage Listings</Link>}
          {!isHost && <Link href="/my-bookings" className="btn btn-outline">View Bookings</Link>}
          <Link href="/studios" className="btn btn-ghost">Browse Studios</Link>
        </div>
      </div>
    </div>
  );
}
