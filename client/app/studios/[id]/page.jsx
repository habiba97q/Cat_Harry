"use client";

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '../../../src/utils/api';
import { toast } from 'sonner';
import { AuthContext } from '../../../src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function StudioDetailsPage({ params }) {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState({ avgRating: 0, count: 0 });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '', hours: 2, notes: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  // Load the listing and its persisted reviews.
  useEffect(() => {
    let active = true;
    const fetchStudio = async () => {
      try {
        const [studioResponse, reviewResponse] = await Promise.all([
          api.get(`/studios/${params.id}`),
          api.get(`/reviews/studio/${params.id}`),
        ]);
        if (!active) return;
        setStudio(studioResponse.data);
        setReviews(reviewResponse.data || []);
        setReviewMeta(reviewResponse.meta || { avgRating: 0, count: 0 });
      } catch (err) {
        if (active) setError(err.message || 'Unable to load this studio');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStudio();
    return () => { active = false; };
  }, [params.id]);

  const images = studio ? [studio.image, ...(studio.gallery || [])].filter(Boolean) : [];
  const amenities = studio?.amenities || [];
  const [activeImg, setActiveImg] = useState(0);

  const total = bookingForm.hours * (studio?.hourlyRate || 0);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to book a studio');
      router.push('/login');
      return;
    }
    if (!bookingForm.date || !bookingForm.time) {
      toast.error('Choose a date and start time');
      return;
    }
    const [startHour, startMinute] = bookingForm.time.split(':').map(Number);
    if (startHour * 60 + startMinute + bookingForm.hours * 60 > 24 * 60) {
      toast.error('The booking must end before midnight');
      return;
    }
    setBookingLoading(true);
    try {
      const payload = {
        studioId: params.id,
        bookingDate: bookingForm.date,
        startTime: bookingForm.time,
        endTime: (() => {
          const [h, m] = bookingForm.time.split(':').map(Number);
          const endMinutes = h * 60 + m + bookingForm.hours * 60;
          const eh = Math.floor(endMinutes / 60);
          const em = endMinutes % 60;
          return `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
        })(),
        notes: bookingForm.notes,
      };
      await api.post('/bookings', payload);
      toast.success('Booking request submitted');
      setBooked(true);
      setBookingOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-xl">{error || 'Studio not found'}</p>
        <Link href="/studios" className="btn btn-primary">Back to Explore Studios</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm breadcrumbs">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/studios">Studios</Link></li>
          <li className="font-medium text-primary">{studio.title}</li>
        </ul>
      </nav>

      {/* Image Gallery */}
      <section className="space-y-3">
        <div className="relative h-80 md:h-[28rem] rounded-2xl overflow-hidden bg-base-200">
          {images.length > 0
            ? <Image src={images[activeImg]} alt={studio.title} fill className="object-cover transition-all duration-500" priority />
            : <div className="h-full flex items-center justify-center text-gray-500">No photos have been added for this studio.</div>}
          <div className="absolute top-4 right-4">
            <span className="badge badge-primary font-semibold px-3 py-2">{studio.category}</span>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{studio.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <strong className="text-base-content">{reviewMeta.avgRating ? reviewMeta.avgRating.toFixed(1) : 'New'}</strong>
                ({reviewMeta.count} reviews)
              </span>
              <span>📍 {studio.address}</span>
              <span>🏷️ {studio.category}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-3">About This Studio</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {studio.overview || 'The host has not added a description yet.'}
            </p>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Category', value: studio.category },
                { label: 'Location', value: studio.address },
                { label: 'Rate', value: `$${studio.hourlyRate}/hour` },
                ...(studio.securityDeposit > 0 ? [{ label: 'Security deposit', value: `$${studio.securityDeposit}` }] : []),
                { label: 'Min. Booking', value: '1 hour' },
                { label: 'Capacity', value: studio.maxCapacity ? `${studio.maxCapacity} people` : 'Not specified' },
              ].map((spec) => (
                <div key={spec.label} className="bg-base-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{spec.label}</p>
                  <p className="font-semibold text-sm">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {amenities.length > 0 && <div>
            <h2 className="text-xl font-bold mb-4">Amenities &amp; Equipment</h2>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>}

          {/* Host Info */}
          <div className="bg-base-200 rounded-2xl p-6 flex items-center gap-4">
            {studio.hostId?.photoURL
              ? <Image src={studio.hostId.photoURL} alt="" width={56} height={56} className="w-14 h-14 rounded-full ring-2 ring-primary object-cover" />
              : <div className="w-14 h-14 rounded-full ring-2 ring-primary bg-primary/10 flex items-center justify-center text-primary font-bold">{studio.hostId?.name?.slice(0, 1) || 'H'}</div>}
            <div className="flex-1">
              <p className="font-bold text-lg">{studio.hostId?.name || 'Studio host'}</p>
              <p className="text-sm text-gray-500">
                Host{studio.hostId?.createdAt ? ` · Member since ${new Date(studio.hostId.createdAt).getFullYear()}` : ''}
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold mb-5">
              Guest Reviews
              <span className="ml-2 text-base font-normal text-gray-500">({reviewMeta.count} reviews)</span>
            </h2>
            {reviews.length === 0
              ? <p className="text-sm text-gray-500">No reviews yet.</p>
              : <div className="space-y-5">
              {reviews.map((r) => (
                <div key={r._id} className="flex gap-4 pb-5 border-b border-base-300 last:border-0">
                  {r.userId?.photoURL
                    ? <Image src={r.userId.photoURL} alt="" width={40} height={40} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                    : <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary font-semibold">{r.userId?.name?.slice(0, 1) || 'U'}</div>}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">{r.userId?.name || 'StudioSpace member'}</p>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-base-100 border border-base-300 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-primary">${studio.hourlyRate}</span>
              <span className="text-gray-500 text-sm">/ hour</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="text-yellow-400">★ {reviewMeta.avgRating ? reviewMeta.avgRating.toFixed(1) : 'New'}</span>
              <span>· {reviewMeta.count} reviews</span>
            </div>
            <hr className="border-base-300" />

            {booked ? (
              <div className="bg-success/10 border border-success rounded-xl p-4 text-center space-y-2">
                <span className="text-3xl">🎉</span>
                <p className="font-bold text-success text-lg">Booking Request Sent!</p>
                <p className="text-sm text-gray-500">Your booking is pending host confirmation.</p>
                <Link href="/my-bookings" className="btn btn-sm btn-success w-full mt-2">View My Bookings</Link>
              </div>
            ) : (
              <>
                <button className="btn btn-primary w-full text-base font-bold" onClick={() => setBookingOpen(true)} disabled={bookingLoading}>
                  {bookingLoading ? <span className="loading loading-spinner"></span> : 'Reserve This Studio'}
                </button>
              </>
            )}
            <div className="text-xs text-center text-gray-400">Send a request; the host will confirm availability.</div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setBookingOpen(false)}>
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Book: {studio.title}</h2>
              <button className="btn btn-ghost btn-circle btn-sm" onClick={() => setBookingOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="label"><span className="label-text font-medium">Date</span></label>
                <input type="date" min={new Date().toISOString().slice(0, 10)} required className="input input-bordered w-full" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} />
              </div>
              <div>
                <label className="label"><span className="label-text font-medium">Start Time</span></label>
                <input type="time" required className="input input-bordered w-full" value={bookingForm.time} onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })} />
              </div>
              <div>
                <label className="label"><span className="label-text font-medium">Duration (hours)</span></label>
                <select className="select select-bordered w-full" value={bookingForm.hours} onChange={(e) => setBookingForm({ ...bookingForm, hours: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 6, 8].map((h) => (
                    <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text font-medium">Notes (optional)</span></label>
                <textarea className="textarea textarea-bordered w-full" maxLength={1000} placeholder="Any special requirements..." rows={3} value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} />
              </div>
              <div className="bg-base-200 rounded-xl p-4 flex justify-between font-bold">
                <span>Estimated Total</span>
                <span className="text-primary">${total}</span>
              </div>
              <button type="submit" className="btn btn-primary w-full text-base font-bold" disabled={bookingLoading}>
                {bookingLoading ? <span className="loading loading-spinner"></span> : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
