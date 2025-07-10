import React from 'react';

const AllUsersIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM10.5 1.5a9 9 0 11-7.06 14.247" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0z" />
  </svg>
);

export default AllUsersIcon;
