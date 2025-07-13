import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient, handleSupabaseError } from '@/utils/supabase-browser';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseSupabaseQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface QueryCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Simple in-memory cache
const queryCache: QueryCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSupabaseQuery<T = any>(
  queryKey: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: UseSupabaseQueryOptions = {}
) {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);
  
  const fetchData = useCallback(async (skipCache = false) => {
    try {
      // Check cache first
      if (!skipCache && queryCache[queryKey]) {
        const cached = queryCache[queryKey];
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          setData(cached.data);
          setLoading(false);
          return cached.data;
        }
      }
      
      setLoading(true);
      setError(null);
      
      const result = await queryFn();
      
      if (!isMountedRef.current) return;
      
      if (result.error) {
        const errorMessage = handleSupabaseError(result.error);
        setError(errorMessage);
        onError?.(errorMessage);
      } else {
        // Update cache
        queryCache[queryKey] = {
          data: result.data,
          timestamp: Date.now(),
        };
        
        setData(result.data);
        onSuccess?.(result.data);
      }
      
      return result.data;
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryKey, queryFn, onSuccess, onError]);
  
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  
  // Clear cache for this query
  const invalidate = useCallback(() => {
    delete queryCache[queryKey];
  }, [queryKey]);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    if (enabled) {
      fetchData();
      
      // Set up refetch interval if specified
      if (refetchInterval && refetchInterval > 0) {
        intervalRef.current = setInterval(() => {
          fetchData(true);
        }, refetchInterval);
      }
    }
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refetchInterval, fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

// Hook for real-time subscriptions with proper cleanup
export function useSupabaseSubscription<T = any>(
  channel: string,
  table: string,
  onInsert?: (payload: T) => void,
  onUpdate?: (payload: T) => void,
  onDelete?: (payload: any) => void
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Create channel
    channelRef.current = supabase
      .channel(channel)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload) => onInsert?.(payload.new as T)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload) => onUpdate?.(payload.new as T)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table },
        (payload) => onDelete?.(payload.old)
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });
    
    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channel, table, onInsert, onUpdate, onDelete]);
  
  return { isSubscribed };
}
