"use client";

import { useState, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../src/context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: '',
    email: '',
    photoURL: '',
    password: '',
    confirm: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    try {
      if (new URL(form.photoURL).protocol !== 'https:') errs.photoURL = 'Photo URL must use HTTPS';
    } catch {
      errs.photoURL = 'A valid photo URL is required';
    }
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6 || !/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password)) {
      errs.password = 'Use at least 6 characters with uppercase and lowercase letters';
    }
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await register({
        name: form.name,
        email: form.email,
        photoURL: form.photoURL,
        password: form.password,
        role: form.role,
      });
      router.push('/login?registered=1');
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || err.message || 'Registration failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-base-100 rounded-3xl shadow-2xl p-8 md:p-10 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 justify-center">
              <Image src="/logo.svg" alt="StudioSpace" width={40} height={40} />
              <span className="font-extrabold text-2xl text-primary">StudioSpace</span>
            </Link>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-gray-500 text-sm">Create an account to book or list a studio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">I am a…</span>
              </label>
              <div className="flex gap-3">
                {[{ value: 'customer', label: '🎨 Creator', desc: 'Book studios' }, { value: 'host', label: '🏠 Host', desc: 'List my studio' }].map((r) => (
                  <label
                    key={r.value}
                    className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      form.role === r.value ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'
                    }`}
                  >
                    <input type="radio" name="role" value={r.value} className="hidden" onChange={() => setForm({ ...form, role: r.value })} />
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                id="reg-name"
                type="text"
                placeholder="Jane Doe"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Profile Photo URL</span></label>
              <input
                id="reg-photo-url"
                type="url"
                required
                placeholder="https://example.com/photo.jpg"
                className={`input input-bordered w-full ${errors.photoURL ? 'input-error' : ''}`}
                value={form.photoURL}
                onChange={(e) => setForm({ ...form, photoURL: e.target.value })}
              />
              {errors.photoURL && <p className="text-error text-xs mt-1">{errors.photoURL}</p>}
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  placeholder="••••••••"
                  className={`input input-bordered w-full ${errors.confirm ? 'input-error' : ''}`}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
                {errors.confirm && <p className="text-error text-xs mt-1">{errors.confirm}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="form-control">
              <label className="cursor-pointer label justify-start gap-2">
                <input type="checkbox" required className="checkbox checkbox-primary checkbox-sm" />
                <span className="label-text text-sm">
                  I agree to use StudioSpace responsibly and follow its terms and privacy policy.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-base font-bold"
            >
              {loading ? 'Creating…' : 'Create Account'}
            </button>
            {errors.submit && <p className="text-error text-center text-sm">{errors.submit}</p>}
            <div className="divider text-xs text-gray-400">OR</div>
            <GoogleSignInButton />
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="link link-primary font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
