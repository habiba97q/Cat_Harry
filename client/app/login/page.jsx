"use client"
import { useState, useContext } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../../src/context/AuthContext'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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
      router.push('/dashboard')
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
                <span className="label-text-alt">
                  <Link href="/" className="link link-primary text-xs">Forgot password?</Link>
                </span>
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

            <div className="form-control">
              <label className="cursor-pointer label justify-start gap-2">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" disabled={loading} />
                <span className="label-text text-sm">Remember me</span>
              </label>
            </div>

            {errors.submit && <p className="text-error text-center text-sm">{errors.submit}</p>}

            <button type="submit" className="btn btn-primary w-full text-base font-bold" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Sign In'}
            </button>

            <div className="divider text-xs text-gray-400">OR</div>

            <button type="button" className="btn btn-outline w-full gap-2" disabled={loading}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="link link-primary font-semibold">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}


