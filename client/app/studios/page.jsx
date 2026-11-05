"use client"
import React, { Suspense, useState, useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import StudioCard from '../../components/StudioCard'
import { api } from '../../src/utils/api'
import { toast } from 'sonner'

const categoryIcons = {
  'Photo Studios': '📷',
  'Sound Stages': '🎬',
  'Podcast Rooms': '🎙️',
  'Music Suites': '🎵',
  'Art Workshops': '🎨',
}

export default function StudiosPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[200px]"><span className="loading loading-spinner text-primary"></span></div>}>
      <StudiosContent />
    </Suspense>
  )
}

function StudiosContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryCategory = searchParams.get('category') || 'All'
  const querySearch = searchParams.get('search') || ''
  const queryPage = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

  const [studios, setStudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({ total: 0, pages: 1 })
  const [retry, setRetry] = useState(0)
  const [activeCategory, setActiveCategory] = useState(queryCategory)
  const [search, setSearch] = useState(querySearch)
  const [page, setPage] = useState(queryPage)

  const itemsPerPage = 12

  useEffect(() => {
    let active = true
    const fetchStudios = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) })
        if (activeCategory !== 'All') params.set('category', activeCategory)
        if (search.trim()) params.set('search', search.trim())
        const response = await api.get(`/studios?${params.toString()}`)
        if (!active) return
        setStudios(response.data || [])
        setMeta(response.meta || { total: 0, pages: 1 })
        if (page > (response.meta?.pages || 1)) setPage(response.meta?.pages || 1)
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load studios')
          toast.error(err.message || 'Failed to load studios')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchStudios()
    return () => { active = false }
  }, [activeCategory, page, retry, search])

  // Sync UI state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory && activeCategory !== 'All') params.set('category', activeCategory)
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())
    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname
    router.replace(url, { scroll: false })
  }, [activeCategory, page, pathname, router, search])

  const totalPages = Math.max(meta.pages || 1, 1)

  useEffect(() => {
    setActiveCategory(queryCategory)
    setSearch(querySearch)
    setPage(queryPage)
  }, [queryCategory, querySearch, queryPage])

  const handleCategory = (cat) => {
    setActiveCategory(cat)
    setPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl text-primary"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
        <button className="btn btn-primary mt-4" onClick={() => setRetry((value) => value + 1)}>
          Retry
        </button>
      </div>
    )
  }

  const allCategories = ['All', ...Object.keys(categoryIcons)]

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white py-12 text-center rounded-b-2xl mb-8">
        <h1 className="text-4xl font-extrabold mb-2">Explore Studios</h1>
        <p className="text-blue-100 text-lg">Discover the perfect creative space for your next project</p>
        <form className="flex gap-2 max-w-xl mx-auto mt-4" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input input-bordered flex-1 bg-white text-gray-900 placeholder-gray-400"
          />
          <button type="submit" className="btn btn-white bg-white text-primary font-bold hover:bg-gray-100">
            Search
          </button>
        </form>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border transition ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary shadow-md scale-105'
                : 'bg-base-200 border-base-300 hover:border-primary hover:text-primary'
            }`}
          >
            {cat !== 'All' && <span>{categoryIcons[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing <span className="font-bold text-base-content">{meta.total}</span> studios
        {activeCategory !== 'All' && (
          <> in <span className="text-primary font-semibold">{activeCategory}</span></>
        )}
        {search && (
          <> matching <span className="text-primary font-semibold">&quot;{search}&quot;</span></>
        )}
      </p>

      {/* Studio Grid */}
      {studios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {studios.map((studio) => (
            <StudioCard
              key={studio._id}
              studio={{
                id: studio._id,
                name: studio.title,
                category: studio.category,
                thumbnail: studio.image,
                price: studio.hourlyRate,
                rating: studio.rating || 0,
                reviews: studio.reviewsCount || 0,
                location: studio.address,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4">
          <span className="text-6xl">🔍</span>
          <h2 className="text-2xl font-bold">No studios found</h2>
          <p className="text-gray-500">Try adjusting your filters or search term.</p>
          <button className="btn btn-primary mt-4" onClick={() => { setActiveCategory('All'); setSearch(''); setPage(1) }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Previous
          </button>
          <span className="px-3 py-2">Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
