"use client";

export default function AdminAtlasLite() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Atlas Lite Admin</h1>
      
      <div className="bg-[#1c1c1a] p-6 rounded-lg border border-[#2d2d2b]">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
          </svg>
          <span className="text-lg font-medium text-white">Market Data Configuration</span>
        </div>
        <p className="text-[#b1b1a9] mb-6">This section will allow administrators to manage market data feeds, visualizations, and user access.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#252523] p-4 rounded border border-[#2d2d2b] hover:border-white transition-colors duration-200">
            <h3 className="font-medium text-white mb-2">Data Sources</h3>
            <p className="text-[#b1b1a9] text-sm">Manage market data providers and feeds</p>
          </div>
          <div className="bg-[#232321] p-4 rounded border border-[#2a2a28] hover:border-[#e3c77b] transition-colors duration-200">
            <h3 className="font-medium text-gray-200 mb-2">Visualizations</h3>
            <p className="text-gray-400 text-sm">Configure chart types and default views</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-[#232321] rounded border border-[#2a2a28]">
          <h3 className="font-medium text-[#e3c77b] mb-2">Data Status</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-300 text-sm">All services operational</span>
          </div>
        </div>

        <button className="mt-6 bg-[#e3c77b] hover:bg-[#d2b66a] text-[#151513] font-medium px-4 py-2 rounded transition-colors duration-200 opacity-50 cursor-not-allowed">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
