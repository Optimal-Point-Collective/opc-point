"use client";

export default function AdminEducation() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Education Admin</h1>
      
      <div className="bg-[#1c1c1a] p-6 rounded-lg border border-[#2d2d2b]">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          <span className="text-lg font-medium text-white">Module Configuration</span>
        </div>
        <p className="text-[#b1b1a9] mb-6">This section will allow administrators to manage education content, courses, and user progress.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#252523] p-4 rounded border border-[#2d2d2b] hover:border-white transition-colors duration-200">
            <h3 className="font-medium text-white mb-2">Courses</h3>
            <p className="text-[#b1b1a9] text-sm">Create and manage courses and lessons</p>
          </div>
          <div className="bg-[#232321] p-4 rounded border border-[#2a2a28] hover:border-[#e3c77b] transition-colors duration-200">
            <h3 className="font-medium text-gray-200 mb-2">Materials</h3>
            <p className="text-gray-400 text-sm">Upload resources, videos, and documents</p>
          </div>
        </div>

        <button className="bg-[#e3c77b] hover:bg-[#d2b66a] text-[#151513] font-medium px-4 py-2 rounded transition-colors duration-200 opacity-50 cursor-not-allowed">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
