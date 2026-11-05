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
export function useDashboard(user) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!user) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const endpoint = user.role === 'host' ? '/dashboard/host' : '/dashboard/customer';
        const response = await api.get(endpoint);
        if (active) setData(response.data);
      } catch (err) {
        if (active) {
          setError(err);
          toast.error(err.message || 'Failed to load dashboard');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchData();
    return () => { active = false; };
  }, [retry, user]);

  return { data, setData, loading, error, retry: () => setRetry((value) => value + 1) };
}
