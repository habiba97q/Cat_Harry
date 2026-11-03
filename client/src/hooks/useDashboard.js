// src/hooks/useDashboard.js
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';

/**
 * Hook to fetch dashboard data for both customer and host.
 * Returns { data, loading, error } where data includes:
 *   - user profile (from auth/me)
 *   - stats: total listings, total bookings (customer view)
 *   - recentBookings (array)
 *   - totalEarnings (host view)
 *   - averageRating (host view)
 */
export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [customerRes, hostRes] = await Promise.all([
          api.get('/dashboard/customer'),
          api.get('/dashboard/host'),
        ]);
        const combined = {
          user: customerRes.user,
          stats: {
            totalListings: customerRes.stats?.totalListings ?? 0,
            totalBookings: customerRes.stats?.totalBookings ?? 0,
          },
          recentBookings: customerRes.recentBookings ?? [],
          totalEarnings: hostRes.totalEarnings ?? 0,
          averageRating: hostRes.averageRating ?? 'N/A',
        };
        setData(combined);
      } catch (err) {
        setError(err);
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}
