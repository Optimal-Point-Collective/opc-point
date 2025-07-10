import React from 'react';

interface SimpleAreaChartProps {
  title: string;
  subtitle?: string;
  data: number[];
  labels: string[];
  color?: string;
  height?: string;
}

export default function SimpleAreaChart({
  title,
  subtitle,
  data,
  labels,
  color = '#4F46E5',
  height = '180px'
}: SimpleAreaChartProps) {
  // Find max value for scaling
  const maxValue = Math.max(...data) * 1.1;
  
  // Generate path for area chart
  const generatePath = () => {
    const width = 100 / (data.length - 1);
    
    let path = `M 0,${100 - (data[0] / maxValue) * 100} `;
    
    for (let i = 1; i < data.length; i++) {
      const x = i * width;
      const y = 100 - (data[i] / maxValue) * 100;
      path += `L ${x},${y} `;
    }
    
    // Complete the area by drawing to the bottom right and back to bottom left
    path += `L ${100},100 L 0,100 Z`;
    
    return path;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      
      <div style={{ height }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          {[0, 25, 50, 75].map((line) => (
            <line
              key={line}
              x1="0"
              y1={line}
              x2="100"
              y2={line}
              stroke="#f1f1f1"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Area chart */}
          <path
            d={generatePath()}
            fill={`${color}20`} // 20% opacity version of the color
            stroke={color}
            strokeWidth="1.5"
          />
          
          {/* Data points */}
          {data.map((value, index) => {
            const x = index * (100 / (data.length - 1));
            const y = 100 - (value / maxValue) * 100;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="white"
                stroke={color}
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {labels.map((label, index) => (
          <span key={index} className="text-xs text-gray-500">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
