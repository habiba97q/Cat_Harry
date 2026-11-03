"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useContext } from 'react';
import { api } from '../../src/utils/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../src/context/AuthContext';

export default function MyListingsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Fetch user studios
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await api.get('/studios/my');
        setListings(data.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchListings();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this studio? This action cannot be undone.')) return;
    try {
      await api.del(`/studios/${id}`);
      setListings((prev) => prev.filter((s) => s._id !== id));
      toast.success('Studio deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete studio');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner text-primary"></span>
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
          { label: 'Active', value: listings.filter((s) => s.status === 'active').length, color: 'text-success' },
          { label: 'Inactive / Pending', value: listings.filter((s) => s.status !== 'active').length, color: 'text-warning' },
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
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={studio.image} alt={studio.title} fill className="object-cover" />
                      </div>
                      <p className="font-semibold text-sm">{studio.title}</p>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{studio.category}</td>
                  <td className="text-sm text-gray-500">{studio.address}</td>
                  <td className="font-semibold text-primary">${studio.hourlyRate}/hr</td>
                  <td>
                    <span className={`badge ${studio.status === 'active' ? 'badge-success' : (studio.status === 'pending' ? 'badge-warning' : 'badge-error')} badge-sm capitalize`}>{studio.status}</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/studios/${studio._id}`} className="btn btn-ghost btn-xs">View</Link>
                      <Link href={`/studios/edit/${studio._id}`} className="btn btn-outline btn-xs btn-primary">Edit</Link>
                      <button onClick={() => handleDelete(studio._id)} className="btn btn-ghost btn-xs text-warning" title="Delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
