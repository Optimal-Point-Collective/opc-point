"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

interface Signal {
  id: string | number;
  ticker: string;
  direction: 'long' | 'short';
  entry1: number;
  entry2?: number;
  stop_loss: number;
  target: number;
  status: 'open' | 'filled' | 'closed' | 'cancelled';
  created_at: string;
  thesis?: string;
  profile?: string;
  bids?: number;
}

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Signal Modal Component
interface SignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal?: Signal | null;
  onSave: (signalData: Partial<Signal>) => void;
}

const SignalModal = ({ isOpen, onClose, signal, onSave }: SignalModalProps) => {
  const [formData, setFormData] = useState({
    ticker: '',
    direction: 'long' as 'long' | 'short',
    entry1: '',
    entry2: '',
    stop_loss: '',
    target: '',
    status: 'open' as 'open' | 'filled' | 'closed' | 'cancelled',
    thesis: '',
    profile: '',
    bids: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (signal) {
      setFormData({
        ticker: signal.ticker,
        direction: signal.direction,
        entry1: signal.entry1.toString(),
        entry2: signal.entry2?.toString() || '',
        stop_loss: signal.stop_loss.toString(),
        target: signal.target?.toString() || '',
        status: signal.status,
        thesis: signal.thesis || '',
        profile: signal.profile || '',
        bids: signal.bids?.toString() || '1'
      });
    } else {
      setFormData({
        ticker: '',
        direction: 'long',
        entry1: '',
        entry2: '',
        stop_loss: '',
        target: '',
        status: 'open',
        thesis: '',
        profile: '',
        bids: '1'
      });
    }
    setIsSubmitting(false);
  }, [signal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Parse numbers safely - handle empty strings
      const entry1 = formData.entry1 ? parseFloat(formData.entry1) : NaN;
      const entry2 = formData.entry2 && formData.entry2.trim() !== '' ? parseFloat(formData.entry2) : undefined;
      const stop_loss = formData.stop_loss ? parseFloat(formData.stop_loss) : NaN;
      const target = formData.target && formData.target.trim() !== '' ? parseFloat(formData.target) : undefined;

      // Validate required numbers
      if (isNaN(entry1)) {
        alert('Entry 1 must be a valid number');
        return;
      }
      if (isNaN(stop_loss)) {
        alert('Stop Loss must be a valid number');
        return;
      }
      if (entry2 !== undefined && isNaN(entry2)) {
        alert('Entry 2 must be a valid number');
        return;
      }
      if (target !== undefined && isNaN(target)) {
        alert('Target must be a valid number');
        return;
      }

      const signalDataToSave = {
        ticker: formData.ticker,
        direction: formData.direction,
        entry1,
        entry2,
        stop_loss,
        target,
        status: formData.status,
        thesis: formData.thesis,
        profile: formData.profile,
        bids: parseInt(formData.bids) || 1
      };

      console.log('🔍 Parsed signal data:', signalDataToSave);
      console.log('🔍 Entry1 type:', typeof entry1, 'value:', entry1);
      console.log('🔍 Stop_loss type:', typeof stop_loss, 'value:', stop_loss);
      console.log('🔍 Target type:', typeof target, 'value:', target);
      
      // Only include id if we're editing an existing signal
      if (signal?.id) {
        (signalDataToSave as Partial<Signal>).id = signal.id;
      }
      
      console.log('🚀 About to call onSave...');
      await onSave(signalDataToSave);
      console.log('✅ onSave completed!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to save signal: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {signal ? 'Edit Signal' : 'Add New Signal'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ticker <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              placeholder="e.g., AAPL, BTC, EUR/USD"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Direction <span className="text-red-500">*</span></label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'long' | 'short' })}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors appearance-none"
              required
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'open' | 'filled' | 'closed' | 'cancelled' })}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors appearance-none"
              required
            >
              <option value="open">Open</option>
              <option value="filled">Filled</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entry 1 <span className="text-red-500">*</span></label>
            <input
              type="number" step="any" value={formData.entry1}
              onChange={(e) => setFormData({ ...formData, entry1: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entry 2 <span className="text-gray-400">(Optional)</span></label>
            <input
              type="number" step="any" value={formData.entry2}
              onChange={(e) => setFormData({ ...formData, entry2: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss <span className="text-red-500">*</span></label>
            <input
              type="number" step="any" value={formData.stop_loss}
              onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target <span className="text-gray-400">(Optional)</span></label>
            <input
              type="number" step="any" value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile</label>
            <input
              type="text"
              value={formData.profile}
              onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
              placeholder="e.g., SCALP, SWING"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bids <span className="text-red-500">*</span></label>
            <input
              type="number" min="1" max="10" value={formData.bids}
              onChange={(e) => setFormData({ ...formData, bids: e.target.value })}
              placeholder="1"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Thesis (Optional)</label>
            <textarea
              value={formData.thesis}
              onChange={(e) => setFormData({ ...formData, thesis: e.target.value })}
              placeholder="Enter the trade thesis..."
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              rows={4}
            />
          </div>
          <div className="md:col-span-2 flex space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-900 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : (signal ? 'Update Signal' : 'Create Signal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getStatusColor = (status: Signal['status']) => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800';
    case 'filled': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-200 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};




function AdminSignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("signals")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching signals:", error);
      alert("Could not fetch signals.");
    } else if (data) {
      setSignals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const handleSaveSignal = async (signalData: Partial<Signal>) => {
    console.log('🔄 Starting save with data:', signalData);

    let response;

    try {
      if (signalData.id) {
        // Update existing signal
        console.log('📝 Updating existing signal with id:', signalData.id);
        response = await supabase.from("signals").update({ ...signalData }).eq("id", signalData.id);
      } else {
        // Create new signal - remove any id field that might be undefined
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newSignalData } = signalData;
        console.log('✨ Creating new signal with data:', newSignalData);
        console.log('🔍 About to insert into database...');
        response = await supabase.from("signals").insert([newSignalData]);
        console.log('🎯 Database insert completed');
      }

      console.log('📡 Supabase response:', response);

      if (response?.error) {
        throw new Error(response.error.message);
      }

      await fetchSignals();
      setIsModalOpen(false);
      setEditingSignal(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('🚫 Save operation failed:', message);
      alert(`Failed to save signal: ${message}`);
    }
  };

  const handleDeleteSignal = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this signal?")) {
      try {
        const { error } = await supabase.from("signals").delete().eq("id", id);

        if (error) {
          alert(`Failed to delete signal: ${error.message}`);
        } else {
          await fetchSignals();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to delete signal: ${message}`);
      }
    }
  };

  const filteredSignals = signals.filter(s => 
    s.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Signals</h1>
        <p className="text-gray-600 mt-1">Manage your trading signals here.</p>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by ticker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-transparent border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
        </div>
        <button
          onClick={() => { setEditingSignal(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-white text-black border-2 border-black rounded-full font-semibold hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
        >
          <PlusIcon />
          Add Signal
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Ticker</th>
              <th scope="col" className="px-6 py-3">Direction</th>
              <th scope="col" className="px-6 py-3">Entry</th>
              <th scope="col" className="px-6 py-3">Stop Loss</th>
              <th scope="col" className="px-6 py-3">Target</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-8 text-gray-500">Loading signals...</td></tr>
            ) : filteredSignals.length > 0 ? (
              filteredSignals.map(signal => (
                <tr key={signal.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{signal.ticker}</td>
                  <td className={`px-6 py-4 font-semibold ${signal.direction === 'long' ? 'text-green-600' : 'text-red-600'}`}>{signal.direction}</td>
                  <td className="px-6 py-4">{signal.entry1}{signal.entry2 ? `, ${signal.entry2}` : ''}</td>
                  <td className="px-6 py-4">{signal.stop_loss}</td>
                  <td className="px-6 py-4">{signal.target}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(signal.status)}`}>
                      {signal.status.charAt(0).toUpperCase() + signal.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => { setEditingSignal(signal); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"><EditIcon /></button>
                    <button onClick={() => handleDeleteSignal(signal.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"><DeleteIcon /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="text-center p-8 text-gray-500">No signals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <SignalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        signal={editingSignal}
        onSave={handleSaveSignal}
      />
    </div>
  );
}

export default AdminSignalsPage;