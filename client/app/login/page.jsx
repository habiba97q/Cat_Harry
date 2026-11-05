"use client"
import { useState, useContext, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../../src/context/AuthContext'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registered') === '1') {
      toast.success('Account created. Sign in to continue.');
    }
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await login(form.email, form.password)
      router.push('/')
    } catch (err) {
      // login already shows toast error
      setErrors({ submit: err.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center -mx-4 -my-6 bg-gradient-to-br from-base-200 to-base-300 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-base-100 rounded-3xl shadow-2xl p-8 md:p-10 space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 justify-center">
              <Image src="/logo.svg" alt="StudioSpace" width={40} height={40} />
              <span className="font-extrabold text-2xl text-primary">StudioSpace</span>
            </Link>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
            </div>

            {errors.submit && <p className="text-error text-center text-sm">{errors.submit}</p>}

            <button type="submit" className="btn btn-primary w-full text-base font-bold" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Sign In'}
            </button>
            <div className="divider text-xs text-gray-400">OR</div>
            <GoogleSignInButton />
          </form>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="link link-primary font-semibold">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
