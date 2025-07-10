
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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
}

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

  useEffect(() => {
    if (signal && riskAmount) {
      calculateResults();
    }
  }, [signal, riskAmount]);

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
    const numBids = 4; // Assuming 4 bids for now

    const top = entry2 ? Math.max(entry1, entry2) : entry1;
    const bottom = entry2 ? Math.min(entry1, entry2) : entry1;

    const priceStep = numBids > 1 ? (top - bottom) / (numBids - 1) : 0;
    const bidPrices = Array.from({ length: numBids }, (_, i) => top - i * priceStep);

    const bidsData = bidPrices.map((price, index) => {
      const riskPerUnit = Math.abs(price - sl);
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
      
      const size = allocatedRisk / riskPerUnit;
      const usdValue = size * price;

      return { price, size, percentage, usdValue };
    });

    setBids(bidsData);

    const totalUsdValue = bidsData.reduce((sum, bid) => sum + bid.usdValue, 0);
    const totalSize = bidsData.reduce((sum, bid) => sum + bid.size, 0);
    const avgEntry = totalSize > 0 ? totalUsdValue / totalSize : 0;
    const profit = totalSize * Math.abs(target - avgEntry);

    setAvgEntryPrice(avgEntry);
    setTotalOrderValue(totalUsdValue);
    setProjectedProfit(profit);

    const leverage = totalUsdValue > 0 ? totalUsdValue / (totalUsdValue - totalSize * sl) : 0;
    setRecommendedLeverage(leverage);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0c0c0c] flex flex-col">
        <MemberHeader />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-semibold text-white mb-8">Precision 2.0</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              {/* Column 1: Trade Parameters */}
              <div className="bg-[#121212] rounded-lg p-6 border border-gray-800 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-bold uppercase text-gray-400">TRADE PARAMETERS</h2>
                  <div className={`w-4 h-4 rounded-full animate-pulse ${tradeDirection === 'long' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TICKER</span>
                    <span className="font-bold">{signal.ticker}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">STOP LOSS</span>
                    <span className="font-bold">{signal.stop_loss}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TARGET</span>
                    <span className="font-bold">{signal.target}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">PROFILE</span>
                    <span className="font-bold">{signal.profile || 'SCALP'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">RISK (USD)</span>
                    <input
                      type="number"
                      value={riskAmount}
                      onChange={(e) => setRiskAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-transparent border border-gray-700 rounded text-right focus:outline-none focus:border-gray-500"
                      placeholder="Input your risk"
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">THESIS</h3>
                  <p className="text-gray-300 italic">{signal.notes || 'No thesis provided.'}</p>
                </div>
              </div>

              {/* Column 2: Order Breakdown */}
              <div className="bg-[#121212] rounded-lg p-6 border border-gray-800 h-full">
                <h2 className="text-sm font-bold uppercase text-gray-400 mb-6">ORDER BREAKDOWN</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TOTAL ORDER VALUE</span>
                    <span className="font-bold">${totalOrderValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">AVERAGE ENTRY</span>
                    <span className="font-bold">{avgEntryPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">PROJECTED PROFIT</span>
                    <span className="font-bold">${projectedProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">RECOMMENDED LEVERAGE</span>
                    <span className="font-bold">{recommendedLeverage.toFixed(2)}x</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">BID EXECUTION PLAN</h3>
                  <div className="space-y-2">
                    {bids.map((bid, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-400">BID {index + 1}</span>
                        <span className="font-bold">{bid.size.toFixed(4)} ({bid.percentage.toFixed(0)}%) @ {bid.price.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
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

