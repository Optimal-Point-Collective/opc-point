import React from 'react';

interface MembershipStatsProps {
  activeMembers: number;
  premiumMembers: number;
  freeMembers: number;
  newThisMonth: number;
  cancellations: number;
}

export default function MembershipStats({
  activeMembers,
  premiumMembers,
  freeMembers,
  newThisMonth,
  cancellations
}: MembershipStatsProps) {
  const renewalRate = Math.round(((activeMembers - newThisMonth) / (activeMembers - newThisMonth + cancellations)) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Membership Breakdown</h3>
      
      <div className="flex flex-col space-y-4">
        {/* Premium vs Free visualization */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-500">Premium</span>
            <span className="font-medium text-gray-500">Free</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
            <div 
              className="bg-indigo-500" 
              style={{ width: `${(premiumMembers / activeMembers) * 100}%` }}
            ></div>
            <div 
              className="bg-blue-300" 
              style={{ width: `${(freeMembers / activeMembers) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-800">{activeMembers.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Members</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-800">{newThisMonth.toLocaleString()}</p>
            <p className="text-xs text-gray-500">New This Month</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-800">{renewalRate}%</p>
            <p className="text-xs text-gray-500">Renewal Rate</p>
          </div>
        </div>
        
        {/* Member distribution by type */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-600">Premium</span>
            </div>
            <span className="text-sm font-medium">{premiumMembers.toLocaleString()} 
              <span className="text-xs text-gray-400 ml-1">
                ({Math.round((premiumMembers / activeMembers) * 100)}%)
              </span>
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-300 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-600">Free</span>
            </div>
            <span className="text-sm font-medium">{freeMembers.toLocaleString()}
              <span className="text-xs text-gray-400 ml-1">
                ({Math.round((freeMembers / activeMembers) * 100)}%)
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
