"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

// Metric Icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SignalsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16.24 7.76C18.28 9.8 18.28 13.2 16.24 15.24M19.07 4.93C22.31 8.17 22.31 13.83 19.07 17.07M7.76 16.24C5.72 14.2 5.72 10.8 7.76 8.76M4.93 19.07C1.69 15.83 1.69 10.17 4.93 6.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 10H23" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

interface DashboardMetrics {
  totalMembers: number;
  activeSignals: number;
  totalRevenue: number;
  previousTotalMembers: number;
  previousActiveSignals: number;
  previousRevenue: number;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMembers: 0,
    activeSignals: 0,
    totalRevenue: 0,
    previousTotalMembers: 0,
    previousActiveSignals: 0,
    previousRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      // Get total members count from profiles table
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active signals count (status = 'open')
      const { count: activeSignals } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Calculate revenue (total members * $50)
      const totalRevenue = (totalMembers || 0) * 50;

      // Get previous month's data for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthISO = lastMonth.toISOString();

      // Get members from last month
      const { count: previousTotalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', lastMonthISO);

      // Get active signals from last month
      const { count: previousActiveSignals } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .lt('created_at', lastMonthISO);

      // Calculate previous revenue
      const previousRevenue = (previousTotalMembers || 0) * 50;

      setMetrics({
        totalMembers: totalMembers || 0,
        activeSignals: activeSignals || 0,
        totalRevenue,
        previousTotalMembers: previousTotalMembers || 0,
        previousActiveSignals: previousActiveSignals || 0,
        previousRevenue
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number): { value: string; positive: boolean } => {
    if (previous === 0) {
      return { value: current > 0 ? '+100%' : '0%', positive: current > 0 };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      positive: change >= 0
    };
  };

  const membersChange = calculatePercentageChange(metrics.totalMembers, metrics.previousTotalMembers);
  const signalsChange = calculatePercentageChange(metrics.activeSignals, metrics.previousActiveSignals);
  const revenueChange = calculatePercentageChange(metrics.totalRevenue, metrics.previousRevenue);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-600">Track insights across OPC platforms</p>
      </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Members Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalMembers}</p>
                <div className="flex items-center mt-2">
                  <p className="text-xs text-gray-500">From last month</p>
                  <span className={`ml-2 text-xs flex items-center ${
                    membersChange.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={membersChange.positive ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {membersChange.value}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <UsersIcon />
              </div>
            </div>
          </div>

          {/* Active Signals Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Signals</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeSignals}</p>
                <div className="flex items-center mt-2">
                  <p className="text-xs text-gray-500">From last month</p>
                  <span className={`ml-2 text-xs flex items-center ${
                    signalsChange.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={signalsChange.positive ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {signalsChange.value}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <SignalsIcon />
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <p className="text-xs text-gray-500">From last month</p>
                  <span className={`ml-2 text-xs flex items-center ${
                    revenueChange.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={revenueChange.positive ? "M7 14L12 9L17 14" : "M7 10L12 15L17 10"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {revenueChange.value}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <DollarIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Membership Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Membership Breakdown</h2>
            
            {/* Progress Bars */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Members</span>
                <span className="text-sm text-gray-600">New Members</span>
              </div>
              
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gray-800 rounded-full" 
                    style={{ 
                      width: `${metrics.totalMembers > 0 ? (metrics.totalMembers / (metrics.totalMembers + 5)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{metrics.totalMembers}</span>
                <span>{Math.max(0, metrics.totalMembers - metrics.previousTotalMembers)}</span>
                <span>{metrics.totalMembers > 0 ? Math.round((metrics.totalMembers / (metrics.totalMembers + Math.max(1, metrics.totalMembers * 0.02))) * 100) : 0}%</span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Members</span>
                <span>New Members</span>
                <span>Retention Rate</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-800 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Total Members</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-1">{metrics.totalMembers}</span>
                  <span className="text-xs text-gray-500">
                    {metrics.totalMembers > 0 ? Math.round((metrics.totalMembers / (metrics.totalMembers + 5)) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">New Members (This Month)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-1">{Math.max(0, metrics.totalMembers - metrics.previousTotalMembers)}</span>
                  <span className="text-xs text-gray-500">
                    {metrics.totalMembers > 0 ? Math.round(((metrics.totalMembers - metrics.previousTotalMembers) / metrics.totalMembers) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcement</h2>
            <div className="space-y-4">
              <div className="text-sm text-gray-700">
                <p className="font-medium">Meeting on Tuesday, 24th June, 2025</p>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Onboarding Session on Saturday, 27th June, 2025</p>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
