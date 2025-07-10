import React from 'react';

interface SignalMetric {
  name: string;
  count: number;
  change: number;
}

interface SignalMetricsProps {
  metrics: SignalMetric[];
}

export default function SignalMetrics({ metrics }: SignalMetricsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Signal Performance</h3>
      
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
              <span className="text-sm text-gray-600">{metric.name}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium mr-3">{metric.count}</span>
              <span className={`text-xs font-medium flex items-center ${
                metric.change > 0 ? 'text-green-500' : metric.change < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {metric.change > 0 && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                )}
                {metric.change < 0 && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                )}
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
