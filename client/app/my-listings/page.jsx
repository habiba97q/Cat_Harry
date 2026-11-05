"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useContext } from 'react';
import { api } from '../../src/utils/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../src/context/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function MyListingsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (!authLoading && user?.role !== 'host') {
      router.replace('/dashboard');
    }
  }, [authLoading, user, router]);

  // Fetch user studios
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get('/studios/my');
        setListings(data.data);
      } catch (err) {
        setError(err.message || 'Failed to load listings');
        toast.error(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'host') fetchListings();
  }, [user, retry]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/studios/${deleteTarget._id}`);
      setListings((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success('Studio deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete studio');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }
  if (authLoading || !user || user.role !== 'host') return null;
  if (error) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-error">{error}</p>
        <button className="btn btn-primary" onClick={() => setRetry((value) => value + 1)}>Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">My Studio Listings</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your listed creative spaces</p>
        </div>
        <Link href="/add-studio" className="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Studio
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Listings', value: listings.length, color: 'text-primary' },
          { label: 'Published', value: listings.length, color: 'text-success' },
          { label: 'Average Rate', value: listings.length ? `$${(listings.reduce((sum, studio) => sum + studio.hourlyRate, 0) / listings.length).toFixed(2)}` : '$0.00', color: 'text-warning' },
        ].map((s) => (
          <div key={s.label} className="bg-base-100 border border-base-300 rounded-2xl p-5 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Listings Table */}
      <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Studio</th>
                <th>Category</th>
                <th>Location</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((studio) => (
                <tr key={studio._id} className="hover:bg-base-200 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-base-200">
                        {studio.image && <Image src={studio.image} alt={studio.title} fill className="object-cover" />}
                      </div>
                      <p className="font-semibold text-sm">{studio.title}</p>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{studio.category}</td>
                  <td className="text-sm text-gray-500">{studio.address}</td>
                  <td className="font-semibold text-primary">${studio.hourlyRate}/hr</td>
                  <td>
                    <span className="badge badge-success badge-sm">Active</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/studios/${studio._id}`} className="btn btn-ghost btn-xs">View</Link>
                      <Link href={`/studios/edit/${studio._id}`} className="btn btn-outline btn-xs btn-primary">Edit</Link>
                      <button onClick={() => setDeleteTarget(studio)} className="btn btn-ghost btn-xs text-warning" title="Delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete studio listing?"
          description={deleteTarget ? `“${deleteTarget.title}” will be permanently deleted. Active booking requests must be cancelled first.` : ''}
          confirmLabel="Delete listing"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}
