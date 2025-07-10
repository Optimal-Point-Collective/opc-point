"use client";

export default function AdminPrecision() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Precision Admin</h1>
      
      <div className="bg-[#1c1c1a] p-6 rounded-lg border border-[#2d2d2b]">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span className="text-lg font-medium text-white">Trading Analytics Configuration</span>
        </div>
        <p className="text-[#b1b1a9] mb-6">This section will allow administrators to manage trading analytics, signals, and user settings.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#252523] p-4 rounded border border-[#2d2d2b] hover:border-white transition-colors duration-200">
            <h3 className="font-medium text-white mb-2">Signals</h3>
            <p className="text-[#b1b1a9] text-sm">Configure trading signals and alerts</p>
          </div>
          <div className="bg-[#232321] p-4 rounded border border-[#2a2a28] hover:border-[#e3c77b] transition-colors duration-200">
            <h3 className="font-medium text-gray-200 mb-2">Analytics</h3>
            <p className="text-gray-400 text-sm">Manage market analytics and reports</p>
          </div>
          <div className="bg-[#232321] p-4 rounded border border-[#2a2a28] hover:border-[#e3c77b] transition-colors duration-200">
            <h3 className="font-medium text-gray-200 mb-2">User Settings</h3>
            <p className="text-gray-400 text-sm">Manage user preferences and notifications</p>
          </div>
        </div>

        <button className="bg-[#e3c77b] hover:bg-[#d2b66a] text-[#151513] font-medium px-4 py-2 rounded transition-colors duration-200 opacity-50 cursor-not-allowed">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
