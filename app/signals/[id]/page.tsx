
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import MemberHeader from '@/app/components/MemberHeader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
  profile?: string;
  bids?: number;
}

import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function PrecisionCalculatorPage() {
  const params = useParams();
  const id = params.id as string;

  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskAmount, setRiskAmount] = useState<number | ''>(() => {
    if (typeof window !== 'undefined') {
      const savedRisk = localStorage.getItem('defaultRisk');
      return savedRisk ? Number(savedRisk) : 40;
    }
    return 40;
  });
  const [bids, setBids] = useState<any[]>([]);
  const [avgEntryPrice, setAvgEntryPrice] = useState(0);
  const [totalOrderValue, setTotalOrderValue] = useState(0);
  const [projectedProfit, setProjectedProfit] = useState(0);
  const [recommendedLeverage, setRecommendedLeverage] = useState(0);
  const [activeCopyModal, setActiveCopyModal] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (signal && riskAmount) {
      calculateResults();
    }
  }, [signal, riskAmount]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActiveCopyModal(null);
      }
    };

    if (activeCopyModal !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeCopyModal]);

  useEffect(() => {
    if (id) {
      const fetchSignal = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('signals')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setSignal(data);
          } else {
            setError('Signal not found.');
          }
        } catch (err: any) {
          setError('Failed to fetch signal data.');
          console.error('Error fetching signal:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchSignal();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-white">
        <div>Loading Calculator...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-red-500">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-white">
        <div>Signal data could not be loaded.</div>
      </div>
    );
  }
  
  const tradeDirection = signal.stop_loss < signal.entry1 ? 'long' : 'short';

  const calculateResults = () => {
    const risk = Number(riskAmount);
    const entry1 = signal.entry1;
    const entry2 = signal.entry2;
    const sl = signal.stop_loss;
    const target = signal.target;
    
    // Use bids from database, fallback to legacy logic if not set
    const numBids = signal.bids || (entry2 && entry2 !== entry1 ? 4 : 1);

    const top = entry2 ? Math.max(entry1, entry2) : entry1;
    const bottom = entry2 ? Math.min(entry1, entry2) : entry1;
    
    // Determine trade direction
    const isLong = sl < bottom;
    const isShort = sl > top;
    
    if (!isLong && !isShort) {
      setBids([]);
      setAvgEntryPrice(0);
      setTotalOrderValue(0);
      setProjectedProfit(0);
      setRecommendedLeverage(0);
      return;
    }

    const priceStep = numBids > 1 ? (top - bottom) / (numBids - 1) : 0;
    // For long positions, start from top and go down
    // For short positions, start from bottom and go up
    const bidPrices = isLong
      ? Array.from({ length: numBids }, (_, i) => top - i * priceStep)
      : Array.from({ length: numBids }, (_, i) => bottom + i * priceStep);

    const FEE = 0.0004; // Combined entry and exit fee ~0.04%
    const bidsData = bidPrices.map((price, index) => {
      const riskPerUnitWithFee = Math.abs(price - sl) + (price * FEE);
      
      if (riskPerUnitWithFee <= 0) return null;
      
      let allocatedRisk = 0;
      let percentage = 0;

      if (numBids === 1) {
        allocatedRisk = risk;
        percentage = 100;
      } else {
        if (index === 0) {
          allocatedRisk = risk * 0.5;
          percentage = 50;
        } else {
          allocatedRisk = (risk * 0.5) / (numBids - 1);
          percentage = 50 / (numBids - 1);
        }
      }
      
      const size = allocatedRisk / riskPerUnitWithFee;
      const usdValue = size * price;

      return { price, size, percentage, usdValue };
    }).filter((bid): bid is any => bid !== null);

    setBids(bidsData);

    const totalUsdValue = bidsData.reduce((sum, bid) => sum + bid.usdValue, 0);
    const totalSize = bidsData.reduce((sum, bid) => sum + bid.size, 0);
    const avgEntry = totalSize > 0 ? totalUsdValue / totalSize : 0;
    const profit = totalSize * Math.abs(target - avgEntry);

    setAvgEntryPrice(avgEntry);
    setTotalOrderValue(totalUsdValue);
    setProjectedProfit(profit);

    // Safer leverage calculation to prevent premature liquidation
    const MMR = 0.005; // Bybit's Maintenance Margin Rate (0.5%)
    const SAFETY_BUFFER = 0.005; // 0.5% safety buffer

    // Use the entry price furthest from the stop-loss for a more conservative leverage calculation.
    const safestEntry = isLong ? top : bottom;

    let safeLeverage = 0;
    if (safestEntry > 0 && sl > 0) {
      if (isLong) {
        const effectiveStopLoss = sl * (1 - SAFETY_BUFFER);
        safeLeverage = safestEntry / (safestEntry - effectiveStopLoss + (safestEntry * MMR));
      } else { // isShort
        const effectiveStopLoss = sl * (1 + SAFETY_BUFFER);
        safeLeverage = safestEntry / (effectiveStopLoss - safestEntry + (safestEntry * MMR));
      }
    }

    // Apply a final safety factor and cap at 100x
    safeLeverage = Math.min(safeLeverage * 0.95, 100);
    setRecommendedLeverage(safeLeverage > 0 ? safeLeverage : 0);
  };

  const copyToClipboard = async (value: string, type: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${type} copied to clipboard!`);
      setActiveCopyModal(null);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const ThreeDotsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="2" r="1" fill="currentColor"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
      <circle cx="8" cy="14" r="1" fill="currentColor"/>
    </svg>
  );

  const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2V14H12V4H10V2H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 2V4H10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0c0c0c] flex flex-col">
        <MemberHeader />
        <div className="flex-1 p-6 pl-16 pr-[120px]">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-semibold text-white">Precision 2.0</h1>
              <div className="text-sm">
                <Link href="/dashboard" className="text-[#9C9C9C] hover:text-white">Home</Link>
                <span className="mx-4 text-[#9C9C9C]">—</span>
                <Link href="/signals" className="text-[#9C9C9C] hover:text-white">Signals</Link>
                <span className="mx-4 text-[#9C9C9C]">—</span>
                <span className="text-white">{signal.ticker}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Column 1: Trade Parameters */}
              <div className="bg-[#121212] rounded-lg p-6 border-[0.5px] border-[#7C7C7C] flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-normal text-[#FCFCFC]">TRADE PARAMETERS</h2>
                  <div className={`w-4 h-4 rounded-full animate-pulse ${
                    tradeDirection === 'long' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="space-y-8 text-lg flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">TICKER</span>
                    <span className="font-bold text-white">{signal.ticker}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">STOP LOSS</span>
                    <span className="font-bold text-white">{signal.stop_loss}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">TARGET</span>
                    <span className="font-bold text-white">{signal.target}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">PROFILE</span>
                    <span className="font-bold text-white">{signal.profile || 'SCALP'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">RISK (USD)</span>
                    <input
                      type="number"
                      value={riskAmount}
                      onChange={(e) => setRiskAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-transparent border border-gray-700 rounded text-right focus:outline-none focus:border-gray-500 text-white"
                      placeholder="Input your risk"
                    />
                  </div>
                </div>
                <div className="mt-10">
                  <h3 className="text-2xl font-normal text-[#FCFCFC] mb-10">THESIS</h3>
                  <p className="text-[#9C9C9C] italic text-lg">{signal.notes || 'No thesis provided.'}</p>
                </div>
              </div>

              {/* Column 2: Order Breakdown */}
              <div className="bg-[#121212] rounded-lg p-6 border-[0.5px] border-[#7C7C7C] flex flex-col">
                <h2 className="text-2xl font-normal text-[#FCFCFC] mb-10">ORDER BREAKDOWN</h2>
                <div className="space-y-8 text-lg flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">TOTAL ORDER VALUE</span>
                    <span className="font-bold text-white">${totalOrderValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">AVERAGE ENTRY</span>
                    <span className="font-bold text-white">{avgEntryPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">PROJECTED PROFIT</span>
                    <span className="font-bold text-white">${projectedProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9C9C9C]">RECOMMENDED LEVERAGE</span>
                    <span className="font-bold text-white">{recommendedLeverage.toFixed(2)}x</span>
                  </div>
                </div>
                <div className="mt-10">
                  <h3 className="text-2xl font-normal text-[#FCFCFC] mb-10">BID EXECUTION PLAN</h3>
                  <div className="space-y-8 text-lg">
                    {bids.map((bid, index) => (
                      <div key={index} className="flex justify-between items-center relative">
                        <span className="text-[#9C9C9C]">BID {index + 1}</span>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-white">{bid.size.toFixed(4)} ({bid.percentage.toFixed(0)}%) @ {bid.price.toFixed(4)}</span>
                          <div className="relative">
                            <button
                              onClick={() => setActiveCopyModal(activeCopyModal === index ? null : index)}
                              className="text-[#9C9C9C] hover:text-white transition-colors p-1"
                            >
                              <ThreeDotsIcon />
                            </button>
                            
                            {/* Copy Options Modal */}
                            {activeCopyModal === index && (
                              <div 
                                ref={modalRef}
                                className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#333333] py-4 z-50"
                              >
                                <button
                                  onClick={() => copyToClipboard(bid.usdValue.toFixed(2), 'Value')}
                                  className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#2a2a2a] transition-colors w-full text-left"
                                >
                                  <CopyIcon />
                                  <span>Copy Value</span>
                                </button>
                                <button
                                  onClick={() => copyToClipboard(bid.size.toFixed(4), 'QTY')}
                                  className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#2a2a2a] transition-colors w-full text-left"
                                >
                                  <CopyIcon />
                                  <span>Copy QTY</span>
                                </button>
                                <button
                                  onClick={() => copyToClipboard(bid.price.toFixed(4), 'Price')}
                                  className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-[#2a2a2a] transition-colors w-full text-left"
                                >
                                  <CopyIcon />
                                  <span>Copy Price</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx global>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}

