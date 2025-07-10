import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    positive: boolean;
  };
  icon?: ReactNode;
  bgColor?: string;
  textColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  textColor = 'text-gray-800'
}: StatsCardProps) {
  return (
    <div className={`p-0 flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className={`text-2xl font-semibold ${textColor} mb-1`}>{value}</div>
      
      {change && (
        <div className="flex items-center mt-auto">
          <span className={`text-xs font-medium ${change.positive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {change.positive ? (
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            ) : (
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            )}
            {change.value}
          </span>
          <span className="text-xs text-gray-400 ml-1">vs. last month</span>
        </div>
      )}
    </div>
  );
}
