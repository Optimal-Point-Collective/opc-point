import React from 'react';

const DashboardIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M2.25 12v10.5a.75.75 0 00.75.75h6a.75.75 0 00.75-.75V16.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v6.75a.75.75 0 00.75.75h6a.75.75 0 00.75-.75V12m-18 0l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955" />
  </svg>
);

export default DashboardIcon;
