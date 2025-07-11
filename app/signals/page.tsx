'use client';

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MemberHeader from "../components/MemberHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import RotatingArrowButton from '../components/RotatingArrowButton';
import Link from 'next/link';
import SettingsModal, { SettingsIcon } from '../components/SettingsModal';

import { toast } from 'react-hot-toast';

interface Signal {
  id: string;
  ticker: string;
  direction: 'LONG' | 'SHORT';
  entry1: number;
  entry2?: number;
  target: number;
  stop_loss: number;
  status: 'OPEN' | 'FILLED' | 'CLOSED' | 'CANCELLED';
  created_at: string;
  pnl_percentage?: number;
  notes?: string;
}

const SIGNALS_PER_PAGE = 4;

const StatusBadge = ({ status }: { status: Signal['status'] }) => {
  const getStatusStyles = () => {
    switch (status.trim().toUpperCase()) {
      case 'OPEN':
        return {
          dotColor: 'bg-blue-500',
          textColor: 'text-white'
        };
      case 'FILLED':
        return {
          dotColor: 'bg-green-500',
          textColor: 'text-white'
        };
      case 'CLOSED':
        return {
          dotColor: 'bg-red-500',
          textColor: 'text-white'
        };
      case 'CANCELLED':
        return {
          dotColor: 'bg-gray-400',
          textColor: 'text-white'
        };
      default:
        return {
          dotColor: 'bg-gray-400',
          textColor: 'text-white'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${styles.dotColor} animate-pulse`} />
      <span className={`text-xl font-medium uppercase ${styles.textColor}`}>
        {status}
      </span>
    </div>
  );
};

function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Link href={`/signals/${signal.id}`} className="block bg-[#121212] rounded-lg p-5 border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg group">
      <div className="grid grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-center w-full">
        {/* Direction Pill */}
        <div className="col-span-2 flex items-center">
          <div className={`w-[90px] flex items-center justify-center px-3 py-2 rounded bg-black ${
            signal.direction?.toUpperCase() === 'LONG' ? 'text-green-500' : 'text-red-500'
          }`}>
            <span className="text-base font-semibold uppercase">
              {signal.direction?.toUpperCase() || 'LONG'}
            </span>
          </div>
        </div>

        {/* Ticker */}
        <div className="col-span-1 pl-1">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">TICKER</div>
          <div className="text-white text-xl font-bold">
            {signal.ticker}
          </div>
        </div>

        {/* Entry Price - 2 columns */}
        <div className="col-span-2 text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">ENTRY PRICE</div>
          <div className="text-white text-xl font-medium">{signal.entry1 ? signal.entry1.toFixed(2) : '-'}</div>
        </div>

        {/* Target - 2 columns */}
        <div className="col-span-2 text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">TARGET</div>
          <div className="text-white text-xl font-medium">{signal.target ? signal.target.toFixed(2) : '-'}</div>
        </div>

        {/* Stop Loss - 2 columns */}
        <div className="col-span-2 text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">STOP LOSS</div>
          <div className="text-white text-xl font-medium">{signal.stop_loss ? signal.stop_loss.toFixed(2) : '-'}</div>
        </div>

        {/* Status - 2 columns */}
        <div className="col-span-2 text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">STATUS</div>
          <div className="flex justify-center">
            <StatusBadge status={signal.status} />
          </div>
        </div>
        
        {/* View Detail - 1 column */}
        <div className="col-span-1 flex justify-center items-center">
          <RotatingArrowButton text="" />
        </div>
      </div>
      
      {/* P&L Row (if available) */}
      {signal.pnl_percentage !== undefined && signal.pnl_percentage !== null && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Profit & Loss</span>
            <span className={`font-medium ${
              signal.pnl_percentage > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {signal.pnl_percentage > 0 ? '+' : ''}{signal.pnl_percentage}%
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18L9 12L15 6" />
        </svg>
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
            currentPage === page
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18L15 12L9 6" />
        </svg>
      </button>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-[#121212] rounded-lg p-6 border border-gray-800 animate-pulse">
        <div className="grid grid-cols-6 gap-6 items-center">
          <div className="col-span-1">
            <div className="h-3 bg-gray-700 rounded mb-2 w-12"></div>
            <div className="h-4 bg-gray-700 rounded mb-1 w-10"></div>
            <div className="h-6 bg-gray-700 rounded w-16"></div>
          </div>
          <div className="col-span-1 text-center">
            <div className="h-3 bg-gray-700 rounded mb-2 w-16 mx-auto"></div>
            <div className="h-5 bg-gray-700 rounded w-12 mx-auto"></div>
          </div>
          <div className="col-span-1 text-center">
            <div className="h-3 bg-gray-700 rounded mb-2 w-12 mx-auto"></div>
            <div className="h-5 bg-gray-700 rounded w-12 mx-auto"></div>
          </div>
          <div className="col-span-1 text-center">
            <div className="h-3 bg-gray-700 rounded mb-2 w-16 mx-auto"></div>
            <div className="h-5 bg-gray-700 rounded w-12 mx-auto"></div>
          </div>
          <div className="col-span-1 text-center">
            <div className="h-3 bg-gray-700 rounded mb-2 w-12 mx-auto"></div>
            <div className="h-5 bg-gray-700 rounded w-12 mx-auto"></div>
          </div>
          <div className="col-span-1 flex justify-end">
            <div className="h-8 w-8 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function SignalsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultRisk, setDefaultRisk] = useState<number | ''>(() => {
    if (typeof window !== 'undefined') {
      const savedRisk = localStorage.getItem('defaultRisk');
      return savedRisk ? Number(savedRisk) : '';
    }
    return '';
  });

  const handleSaveSettings = () => {
  localStorage.setItem('defaultRisk', String(defaultRisk));
  toast.success('Default risk saved successfully!');
  setIsSettingsOpen(false);
};

  // Fetch signals from Supabase
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('signals')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        console.log('Fetched signals data:', data);
        setSignals(data || []);
      } catch (err) {
        console.error('Error fetching signals:', err);
        setError('Failed to fetch signals');
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();

    // Set up real-time subscription
    const subscription = supabase
      .channel('signals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signals'
        },
        (payload) => {
          console.log('Signals change received:', payload);
          if (payload.eventType === 'INSERT') {
            setSignals(currentSignals => [payload.new as Signal, ...currentSignals]);
          } else if (payload.eventType === 'UPDATE') {
            setSignals(currentSignals => 
              currentSignals.map(s => s.id === payload.new.id ? { ...s, ...payload.new } as Signal : s)
            );
          } else if (payload.eventType === 'DELETE') {
            setSignals(currentSignals => currentSignals.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const totalPages = Math.ceil(signals.length / SIGNALS_PER_PAGE);
  const startIndex = (currentPage - 1) * SIGNALS_PER_PAGE;
  const endIndex = startIndex + SIGNALS_PER_PAGE;
  const currentSignals = signals.slice(startIndex, endIndex);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0c0c0c] flex flex-col">
        <MemberHeader />
        
        <main className="flex-1 p-6 pl-16 pr-[120px]">
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-semibold text-white">Signals</h1>
              <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white">
                <SettingsIcon />
              </button>
            </div>
            
            {/* Error State */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}
            
            {/* Loading State */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Signals Cards */}
                {currentSignals.length > 0 ? (
                  <div className="space-y-4">
                    {currentSignals.map((signal) => (
                      <SignalCard key={signal.id} signal={signal} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#121212] rounded-lg p-12 border border-gray-800 text-center">
                    <div className="text-gray-400 text-lg mb-2">No signals found</div>
                    <div className="text-gray-500 text-sm">Check back later for new trading signals</div>
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </main>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          defaultRisk={defaultRisk}
          setDefaultRisk={setDefaultRisk}
        />
      </div>
    </ProtectedRoute>
  );
}
