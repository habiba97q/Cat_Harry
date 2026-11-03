// src/app/add-studio/page.jsx
"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { demoCategories } from '../../data/demoCategories';
import { api } from '../../src/utils/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const initialForm = {
  title: '',
  category: '',
  location: '',
  rate: '',
  capacity: '',
  description: '',
  amenities: '',
};

export default function AddStudioPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({ image: null, gallery: [] });
  const fileInputRef = useRef(null);
  const router = useRouter();

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Studio name is required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.rate || isNaN(form.rate) || Number(form.rate) <= 0) errs.rate = 'Enter a valid hourly rate';
    if (!form.description.trim()) errs.description = 'Description is required';
    return errs;
  };

  const handleFileChange = (e) => {
    const { name, files: selected } = e.target;
    if (name === 'image') {
      setFiles((prev) => ({ ...prev, image: selected[0] }));
    } else if (name === 'gallery') {
      setFiles((prev) => ({ ...prev, gallery: Array.from(selected) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (files.image) formData.append('image', files.image);
      files.gallery.forEach((file) => formData.append('gallery', file));
      await api.post('/studios', formData);
      toast.success('Studio created successfully');
      router.push('/my-listings');
    } catch (err) {
      toast.error(err.message || 'Failed to create studio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">List Your Studio</h1>
        <p className="text-gray-500 mt-1">Fill in the details below to create your listing and start earning.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-base-300 text-gray-500'}`}>{s}</div>
            {s < 3 && <div className={`h-1 w-12 rounded transition-colors ${step > s ? 'bg-primary' : 'bg-base-300'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-gray-500">{step === 1 ? 'Basic Info' : step === 2 ? 'Details' : 'Review'}</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-base-100 border border-base-300 rounded-2xl p-8 space-y-6">
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold border-b border-base-300 pb-3">Basic Information</h2>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Studio Name *</span></label>
              <input
                id="studio-title"
                type="text"
                placeholder="e.g. Sunset Photography Studio"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={loading}
              />
              {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Category *</span></label>
                <select
                  id="studio-category"
                  className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {demoCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-error text-xs mt-1">{errors.category}</p>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Location *</span></label>
                <input
                  id="studio-location"
                  type="text"
                  placeholder="e.g. Los Angeles, CA"
                  className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  disabled={loading}
                />
                {errors.location && <p className="text-error text-xs mt-1">{errors.location}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Hourly Rate (USD) *</span></label>
                <div className="input-group">
                  <span className="bg-base-300 px-3 flex items-center rounded-l-lg border border-base-300 border-r-0">$</span>
                  <input
                    id="studio-rate"
                    type="number"
                    placeholder="50"
                    min="1"
                    className={`input input-bordered w-full rounded-l-none ${errors.rate ? 'input-error' : ''}`}
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    disabled={loading}
                  />
                </div>
                {errors.rate && <p className="text-error text-xs mt-1">{errors.rate}</p>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Max Capacity</span></label>
                <input
                  id="studio-capacity"
                  type="number"
                  placeholder="e.g. 10"
                  min="1"
                  className="input input-bordered w-full"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
            <button type="button" className="btn btn-primary w-full" onClick={() => setStep(2)} disabled={loading}>Next: Add Details →</button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-lg font-bold border-b border-base-300 pb-3">Studio Details</h2>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Description *</span></label>
              <textarea
                id="studio-description"
                rows={5}
                placeholder="Describe your studio, its features, and what makes it special..."
                className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={loading}
              />
              {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Amenities (comma-separated)</span></label>
              <input
                id="studio-amenities"
                type="text"
                placeholder="e.g. WiFi, Parking, Professional Lighting"
                className="input input-bordered w-full"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                disabled={loading}
              />
            </div>
            {/* Photo Upload */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Studio Photos</span></label>
              <div className="border-2 border-dashed border-base-300 rounded-xl p-8 text-center bg-base-200 cursor-pointer hover:border-primary transition-colors" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                <span className="text-4xl mb-3 block">📷</span>
                <p className="font-medium">Click to upload cover photo</p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                <input type="file" name="image" accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                <input type="file" name="gallery" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setStep(1)} disabled={loading}>← Back</button>
              <button type="button" className="btn btn-primary flex-1" onClick={() => setStep(3)} disabled={loading}>Next: Review →</button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-lg font-bold border-b border-base-300 pb-3">Review & Submit</h2>
            <div className="bg-base-200 rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Studio Name</span><p className="font-semibold">{form.title || '—'}</p></div>
                <div><span className="text-gray-500">Category</span><p className="font-semibold">{form.category || '—'}</p></div>
                <div><span class="text-gray-500">Location</span><p className="font-semibold">{form.location || '—'}</p></div>
                <div><span class="text-gray-500">Rate</span><p className="font-semibold">${form.rate || '—'}/hr</p></div>
                <div className="col-span-2"><span class="text-gray-500">Description</span><p className="font-semibold">{form.description || '—'}</p></div>
                <div className="col-span-2"><span class="text-gray-500">Amenities</span><p className="font-semibold">{form.amenities || '—'}</p></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setStep(2)} disabled={loading}>← Back</button>
              <button type="submit" className="btn btn-primary flex-1 font-bold" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Submit Listing'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
