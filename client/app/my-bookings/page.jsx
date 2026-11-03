"use client";
import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../../src/utils/api';
import { toast } from 'sonner';
import { AuthContext } from '../../src/context/AuthContext';
import { useRouter } from 'next/navigation';

const statusColors = {
  confirmed: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-error',
  completed: 'badge-info',
};

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.get('/bookings/my');
        // Ensure studio field is populated (controller populates studioId)
        const enriched = data.data.map((b) => ({
          ...b,
          studio: b.studioId || null,
        }));
        setBookings(enriched);
      } catch (err) {
        toast.error(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b))
      );
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">My Bookings</h1>
        <p className="text-gray-500 mt-1">Track all your studio reservations in one place</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: '📅' },
          { label: 'Upcoming', value: bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length, icon: '🔜' },
          { label: 'Completed', value: bookings.filter((b) => b.status === 'completed').length, icon: '✅' },
          { label: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, icon: '❌' },
        ].map((s) => (
          <div key={s.label} className="bg-base-100 border border-base-300 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-primary">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setActiveTab(t);
              setPage(1);
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {paginated.map((booking) => (
          <div key={booking._id} className="bg-base-100 border border-base-300 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow">
            {/* Studio Image */}
            {booking.studio && (
              <div className="relative w-full sm:w-32 h-28 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={booking.studio.image} alt={booking.studio.title} fill className="object-cover" />
              </div>
            )}
            {/* Booking Details */}
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-lg">
                  {booking.studio ? booking.studio.title : 'Studio'}
                </h2>
                <span className={`badge ${statusColors[booking.status] || 'badge-ghost'} badge-sm capitalize flex-shrink-0`}>${booking.status}</span>
              </div>
              <p className="text-sm text-gray-500">📍 {booking.studio?.address || 'Location unavailable'}</p>
              <p className="text-sm text-gray-500">📅 {new Date(booking.bookingDate).toLocaleDateString()} · 🕐 {booking.startTime}‑{booking.endTime}</p>
              <p className="text-sm text-gray-500">⏱️ {booking.totalHours} hour{booking.totalHours > 1 ? 's' : ''}</p>
              <p className="font-semibold text-primary">Total: ${booking.totalPrice?.toFixed(2) || (booking.totalHours * (booking.studio?.hourlyRate || 0)).toFixed(2)}</p>
            </div>
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-center sm:items-end">
              {booking.studio && (
                <Link href={`/studios/${booking.studio._id}`} className="btn btn-outline btn-sm btn-primary">View Studio</Link>
              )}
              {booking.status === 'pending' && (
                <button className="btn btn-ghost btn-sm text-error" onClick={() => handleCancel(booking._id)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="btn btn-sm btn-ghost"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="btn btn-sm btn-ghost disabled">Page {page} of {totalPages}</span>
          <button
            className="btn btn-sm btn-ghost"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {paginated.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <span className="text-6xl">📅</span>
          <h2 className="text-2xl font-bold">No bookings found</h2>
          <p className="text-gray-500">Explore studios and make your first reservation!</p>
          <Link href="/studios" className="btn btn-primary mt-4">Browse Studios</Link>
        </div>
      )}
    </div>
  );
}
