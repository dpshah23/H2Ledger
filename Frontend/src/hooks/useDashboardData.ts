import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/dashboard';

import { DashboardAnalytics as ApiDashboardData } from '../services/dashboard';

// Transform the API response to match our component's expected format
export interface DashboardData {
  total_credits_owned: number;
  credits_traded: {
    today: number;
    this_week: number;
  };
  market_price: {
    current: number;
    change_24h: string;
  };
  emissions_offset: {
    total: number;
    monthly_progress: number;
    target: number;
  };
  market_price_trend: Array<{
    date: string;
    price: number;
  }>;
}

const transformApiData = (apiData: ApiDashboardData): DashboardData => ({
  total_credits_owned: apiData.totalCreditsOwned,
  credits_traded: {
    today: apiData.creditsTraded.today,
    this_week: apiData.creditsTraded.thisWeek,
  },
  market_price: {
    current: apiData.marketPrice.current,
    change_24h: apiData.marketPrice.change24h.toString(),
  },
  emissions_offset: {
    total: apiData.emissionsOffset.total,
    monthly_progress: apiData.emissionsOffset.thisMonth,
    target: apiData.emissionsOffset.target,
  },
  market_price_trend: apiData.marketPrice.trend,
});

interface CachedData {
  data: DashboardData;
  timestamp: number;
}

interface DashboardHookReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  refetch: () => Promise<void>;
}

const CACHE_DURATION = 30000; // 30 seconds
const REFRESH_INTERVAL = 60000; // 1 minute
const LOADING_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const useDashboardData = (): DashboardHookReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const cache = useRef<CachedData | null>(null);
  const retryCount = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const loadingTimer = useRef<NodeJS.Timeout>();
  const staleness = useRef<NodeJS.Timeout>();

  const validateDashboardData = (data: any): data is DashboardData => {
    try {
      return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.total_credits_owned === 'number' &&
        typeof data.credits_traded === 'object' &&
        typeof data.credits_traded.today === 'number' &&
        typeof data.credits_traded.this_week === 'number' &&
        typeof data.market_price === 'object' &&
        typeof data.market_price.current === 'number' &&
        typeof data.market_price.change_24h === 'string' &&
        typeof data.emissions_offset === 'object' &&
        typeof data.emissions_offset.total === 'number' &&
        typeof data.emissions_offset.monthly_progress === 'number' &&
        typeof data.emissions_offset.target === 'number' &&
        Array.isArray(data.market_price_trend) &&
        data.market_price_trend.every((point: any) =>
          typeof point === 'object' &&
          typeof point.date === 'string' &&
          typeof point.price === 'number'
        )
      );
    } catch {
      return false;
    }
  };

  const fetchDashboardData = useCallback(async (retry = false) => {
    try {
      // Clear previous fetch if still pending
      if (controller.current) {
        controller.current.abort();
      }
      
      // Only show loading state if no cached data or explicit retry
      if (!cache.current?.data || retry) {
        setLoading(true);
        loadingTimer.current = setTimeout(() => {
          setError('Request timeout - please try again');
          setLoading(false);
        }, LOADING_TIMEOUT);
      }

      controller.current = new AbortController();
      const apiResponse = await dashboardService.getAnalytics();
      const transformedData = transformApiData(apiResponse);

      if (!validateDashboardData(transformedData)) {
        throw new Error('Invalid data format received from server');
      }

      clearTimeout(loadingTimer.current);
      cache.current = { data: transformedData, timestamp: Date.now() };
      setData(transformedData);
      setError(null);
      setIsStale(false);
      retryCount.current = 0;

      // Set up staleness timer
      clearTimeout(staleness.current);
      staleness.current = setTimeout(() => {
        setIsStale(true);
      }, CACHE_DURATION);

    } catch (err) {
      clearTimeout(loadingTimer.current);
      
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      
      if (retryCount.current < MAX_RETRIES && !retry) {
        retryCount.current++;
        setTimeout(() => {
          fetchDashboardData(true);
        }, RETRY_DELAY * retryCount.current);
        return;
      }

      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
      
      // Keep showing stale data if available
      if (!cache.current?.data) {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  useEffect(() => {
    // Use cached data if available and fresh
    if (cache.current && Date.now() - cache.current.timestamp < CACHE_DURATION) {
      setData(cache.current.data);
      setLoading(false);
      setError(null);
      
      // Still fetch in background to update cache
      fetchDashboardData();
    } else {
      fetchDashboardData();
    }

    const interval = setInterval(() => {
      fetchDashboardData();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
      clearTimeout(loadingTimer.current);
      clearTimeout(staleness.current);
      if (controller.current) {
        controller.current.abort();
      }
    };
  }, [fetchDashboardData]);

  return { data, loading, error, isStale, refetch };
};
