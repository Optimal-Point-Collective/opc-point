
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

import Link from 'next/link';

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
        <main className="flex-1 p-8 flex">
          <div className="max-w-6xl mx-auto flex flex-col w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              {/* Column 1: Trade Parameters */}
              <div className="bg-[#121212] rounded-lg p-6 border border-gray-800 flex flex-col">
                <h2 className="text-2xl font-normal text-[#FCFCFC] mb-10">TRADE PARAMETERS</h2>
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
              <div className="bg-[#121212] rounded-lg p-6 border border-gray-800 flex flex-col">
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
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-[#9C9C9C]">BID {index + 1}</span>
                        <span className="font-bold text-white">{bid.size.toFixed(4)} ({bid.percentage.toFixed(0)}%) @ {bid.price.toFixed(4)}</span>
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

