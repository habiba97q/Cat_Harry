"use client";
import { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../../src/utils/api';
import { toast } from 'sonner';
import { AuthContext } from '../../../../src/context/AuthContext';
import { demoCategories } from '../../../../data/demoCategories'; // fallback categories list

export default function EditStudioPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [studio, setStudio] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    address: '',
    hourlyRate: '',
    securityDeposit: '',
    maxCapacity: '',
    overview: '',
    amenities: '',
  });
  const [files, setFiles] = useState({ image: null, gallery: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  // Fetch studio data
  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const data = await api.get(`/studios/${params.id}`);
        const s = data.data;
        setStudio(s);
        setForm({
          title: s.title || '',
          category: s.category || '',
          address: s.address || '',
          hourlyRate: s.hourlyRate?.toString() || '',
          securityDeposit: s.securityDeposit?.toString() || '',
          maxCapacity: s.maxCapacity?.toString() || '',
          overview: s.overview || '',
          amenities: Array.isArray(s.amenities) ? s.amenities.join(', ') : s.amenities || '',
        });
      } catch (err) {
        toast.error(err.message || 'Failed to load studio');
        router.replace('/my-listings');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStudio();
  }, [user, params.id, router]);

  const handleFileChange = (e) => {
    const { name, files: selected } = e.target;
    if (name === 'image') {
      setFiles((prev) => ({ ...prev, image: selected[0] }));
    } else if (name === 'gallery') {
      setFiles((prev) => ({ ...prev, gallery: Array.from(selected) }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Studio name is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.address.trim()) errs.address = 'Location is required';
    if (!form.hourlyRate || isNaN(form.hourlyRate) || Number(form.hourlyRate) <= 0)
      errs.hourlyRate = 'Valid hourly rate required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      toast.error('Please fix form errors');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (files.image) formData.append('image', files.image);
      if (files.gallery.length) files.gallery.forEach((f) => formData.append('gallery', f));
      await api.put(`/studios/${params.id}`, formData);
      toast.success('Studio updated');
      router.push('/my-listings');
    } catch (err) {
      toast.error(err.message || 'Failed to update studio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (!studio) return null; // safety

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm breadcrumbs">
        <ul>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/my-listings">My Listings</Link></li>
          <li className="font-medium text-primary">Edit Studio</li>
        </ul>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold">Edit Studio</h1>
        <p className="text-gray-500 mt-1">Update details for: <span className="font-semibold text-primary">{studio.title}</span></p>
      </div>

      {/* Current cover image */}
      <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
        <Image src={studio.image} alt={studio.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
          <button className="btn btn-white bg-white gap-2 text-sm">Change Cover Photo</button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input type="file" name="image" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <input type="file" name="gallery" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

      <form onSubmit={handleSubmit} className="bg-base-100 border border-base-300 rounded-2xl p-8 space-y-6">
        <div className="form-control">
          <label className="label"><span className="label-text font-medium">Studio Name *</span></label>
          <input
            type="text"
            className={`input input-bordered w-full`}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            disabled={saving}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Category *</span></label>
            <select
              className={`select select-bordered w-full`}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              disabled={saving}
            >
              <option value="">Select category</option>
              {demoCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Location *</span></label>
            <input
              type="text"
              className={`input input-bordered w-full`}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={saving}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Hourly Rate (USD) *</span></label>
            <input
              type="number"
              min="1"
              className={`input input-bordered w-full`}
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              disabled={saving}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Security Deposit (optional)</span></label>
            <input
              type="number"
              min="0"
              className={`input input-bordered w-full`}
              value={form.securityDeposit}
              onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
              disabled={saving}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Max Capacity</span></label>
            <input
              type="number"
              min="1"
              className="input input-bordered w-full"
              value={form.maxCapacity}
              onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
              disabled={saving}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Overview</span></label>
            <textarea
              rows={3}
              className="textarea textarea-bordered w-full"
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
              disabled={saving}
            />
          </div>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text font-medium">Amenities (comma-separated)</span></label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={form.amenities}
            onChange={(e) => setForm({ ...form, amenities: e.target.value })}
            disabled={saving}
          />
        </div>
        <div className="flex gap-3">
          <Link href="/my-listings" className="btn btn-ghost flex-1">Cancel</Link>
          <button type="submit" className="btn btn-primary flex-1 font-bold" disabled={saving}>
            {saving ? <span className="loading loading-spinner"></span> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
