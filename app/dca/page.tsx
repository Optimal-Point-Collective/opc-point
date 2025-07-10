'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Define the structure for a single bid
interface Bid {
  price: number;
  amount: number;
  percentage: number;
}

export default function DCAToolPage() {
  // Function to handle copying bid size to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard', {
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '4px',
        },
        duration: 2000,
      });
    } catch (err) {
      toast.error('Failed to copy', {
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '4px',
        },
      });
      console.error('Failed to copy: ', err);
    }
  };
  // State for all the input fields, now allowing empty strings
  const [risk, setRisk] = useState<number | ''>('');
  const [dcaTop, setDcaTop] = useState<number | ''>('');
  const [dcaBottom, setDcaBottom] = useState<number | ''>('');
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [numBids, setNumBids] = useState<number | ''>('');

  // Memoize the calculation to avoid re-computing on every render
  const orderBreakdown = useMemo<Bid[]>(() => {
    const riskVal = Number(risk) || 0;
    const dcaTopVal = Number(dcaTop) || 0;
    const dcaBottomVal = Number(dcaBottom) || 0;
    const stopLossVal = Number(stopLoss) || 0;
    const numBidsVal = Number(numBids) || 0;

    if (numBidsVal <= 0 || dcaTopVal <= dcaBottomVal || dcaBottomVal <= stopLossVal || riskVal <= 0) {
      return [];
    }

    const bids: Bid[] = [];
    const bidPrices: number[] = [];

    // 1. Calculate bid prices, spaced linearly between top and bottom
    if (numBidsVal === 1) {
      bidPrices.push(dcaTopVal);
    } else {
      const priceStep = (dcaTopVal - dcaBottomVal) / (numBidsVal - 1);
      for (let i = 0; i < numBidsVal; i++) {
        bidPrices.push(dcaTopVal - i * priceStep);
      }
    }

    // 2. Determine the percentage of risk for each bid
    const bidPercentages: number[] = [];
    if (numBidsVal > 2) {
      bidPercentages.push(50); // 50% for the first bid
      const otherBidsPercentage = 50 / (numBidsVal - 1);
      for (let i = 1; i < numBidsVal; i++) {
        bidPercentages.push(otherBidsPercentage);
      }
    } else {
      const percentagePerBid = 100 / numBidsVal;
      for (let i = 0; i < numBidsVal; i++) {
        bidPercentages.push(percentagePerBid);
      }
    }

    // 3. For each bid, calculate its size based on its allocated risk
    for (let i = 0; i < numBidsVal; i++) {
      const price = bidPrices[i];
      const percentage = bidPercentages[i];
      const riskForBid = riskVal * (percentage / 100);

      // A bid price at or below the stop loss is invalid
      if (price <= stopLossVal) {
        return []; // Invalidate the entire breakdown if one bid is impossible
      }

      const amount = riskForBid / (price - stopLossVal);

      bids.push({
        price,
        amount,
        percentage,
      });
    }

    return bids;
  }, [risk, dcaTop, dcaBottom, stopLoss, numBids]);

  // Helper function to render input fields
  const renderInputField = (
    label: string,
    value: number | '',
    setter: (value: number | '') => void
  ) => (
    <div className="flex items-center justify-between mb-6">
      <label className="text-[#9C9C9C] uppercase tracking-wide text-sm">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setter(e.target.value === '' ? '' : parseFloat(e.target.value))}
        className="w-36 bg-[#0A0A0A] text-white py-2 px-3 text-right text-lg font-medium focus:outline-none"
      />
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-0 font-montserrat">
      {/* Toast container */}
      <div>
        {toast.custom(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (_t) => (
          <div className="hidden">{/* This is just to ensure toast is initialized */}</div>
        ))}
      </div>
      <h1 className="text-2xl font-bold p-6">DCA Tool</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
        {/* Trade Parameters Section */}
        <div className="bg-[#0F0F0F] p-8 rounded-md">
          <h2 className="text-sm uppercase tracking-wide mb-8 flex items-center justify-between text-[#9C9C9C]">
            TRADE PARAMETERS
            <div className="w-5 h-5 rounded-full border border-[#9C9C9C] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#9C9C9C]"></div>
            </div>
          </h2>
          <div>
            {renderInputField('RISK (USD)', risk, setRisk)}
            {renderInputField('DCA TOP', dcaTop, setDcaTop)}
            {renderInputField('DCA BOTTOM', dcaBottom, setDcaBottom)}
            {renderInputField('STOP LOSS', stopLoss, setStopLoss)}
            {renderInputField('BIDS', numBids, setNumBids)}
          </div>
        </div>

        {/* Order Breakdown Section */}
        <div className="bg-[#0F0F0F] p-8 rounded-md">
          <h2 className="text-sm uppercase tracking-wide mb-8 text-[#9C9C9C]">ORDER BREAKDOWN</h2>
          <div className="space-y-6">
            {orderBreakdown.length > 0 ? (
              orderBreakdown.map((bid, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-[#9C9C9C] uppercase text-sm">BID {index + 1}</span>
                  <div className="flex items-center">
                    <span 
                      className="text-lg font-medium cursor-pointer hover:text-white transition-colors duration-200"
                      onClick={() => copyToClipboard(bid.amount.toFixed(1))}
                      title="Click to copy size"
                    >
                      {bid.amount.toFixed(1)}
                    </span>
                    <span className="text-lg font-medium"> ({bid.percentage.toFixed(0)}%) @ {bid.price.toFixed(4)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#9C9C9C]">Enter valid trade parameters to see the breakdown.</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
