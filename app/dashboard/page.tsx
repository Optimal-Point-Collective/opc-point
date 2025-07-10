"use client";

import MemberHeader from "../components/MemberHeader";
import Image from 'next/image';
import RotatingArrowButton from '../components/RotatingArrowButton';
import Link from 'next/link';

interface NewsCardProps {
  source: string;
  title: string;
  time: string;
  image?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ source, title, time, image }) => (
  <div className="bg-opc-secondary-dark p-4 rounded-lg flex items-center space-x-4">
    {image ? (
      <Image src={image} alt={title} width={80} height={80} className="w-20 h-20 rounded-lg object-cover flex-shrink-0"/>
    ) : (
      <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V6.375c0-.621.504-1.125 1.125-1.125H9.75" />
        </svg>
      </div>
    )}
    <div>
      <p className="text-xs text-gray-400">{source}</p>
      <h4 className="font-semibold mt-1">{title}</h4>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

function MemberDashboard() {
  return (
      <div className="flex-1 flex flex-col bg-[#0c0c0c]">
      <MemberHeader />
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-opc-primary-dark p-6 rounded-lg min-h-[14rem]">
              <h2 className="text-3xl font-bold">Welcome Back</h2>
              <p className="text-gray-400 mt-2">12 <span className="text-sm">Days left in your OPC membership</span></p>
              <RotatingArrowButton text="RENEW" className="mt-4" />
            </div>
            <div className="space-y-6">
                <NewsCard source="CNN" title="FED KEEPS RATES STEADY" time="19m ago · Faith Hill" />
                <NewsCard source="FINANCIAL TIMES" title="TARIFFS ON CHINA SUSPENDED TILL JULY" time="52m ago · Kennedy Jus" />
                <NewsCard source="FINANCIAL TIMES" title="IRAN-ISRAEL ALL-OUT-WAR" time="3h ago · Tucker Jones" />
            </div>
            <div className="flex justify-start">
              <RotatingArrowButton text="SEE MORE" />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6 lg:col-span-1 flex flex-col">
            <div className="bg-opc-secondary-dark p-6 rounded-lg min-h-[14rem] flex flex-col justify-between">
              <h3 className="text-lg font-semibold">Win rate</h3>
              <p className="text-6xl font-bold mt-2">54%</p>
              <p className="text-sm text-gray-400 mt-2">Total Wins: <span className="text-white">15</span>, Losses: <span className="text-red-500">13</span></p>
            </div>
            <div className="bg-opc-secondary-dark p-6 rounded-lg flex-grow flex flex-col">
              <h3 className="text-lg font-semibold">Learning Resource</h3>
              <div className="mt-4 relative flex-grow flex flex-col">
                <div className="relative w-full pb-[56.25%] mb-4"> {/* 16:9 Aspect Ratio */}
                  <Image src="/placeholder-video.png" alt="Learning Resource" layout="fill" objectFit="cover" className="rounded-lg"/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </div>
                </div>
                <h4 className="text-xl font-bold mt-4">Setting 2 entries on Bybit</h4>
                <p className="text-gray-400 text-sm mt-2 flex-grow">Plan your trade with precision. Set up dual entry points to optimize execution and manage risk.</p>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-6 lg:col-span-1 flex flex-col">
            <div className="bg-opc-secondary-dark p-6 rounded-lg min-h-[14rem]">
              <h3 className="text-lg font-semibold">Daily Brief</h3>
              <ul className="text-sm text-gray-300 mt-4 space-y-3">
                <li>BTC testing $102,000; breakout could spark momentum.</li>
                <li>FOMC decision today—expect volatility.</li>
                <li>US PCE inflation numbers come out Friday and could impact risk sentiment.</li>
              </ul>
            </div>
            <div className="flex-grow flex flex-col space-y-6">
                <Link href="/signals" className="group bg-opc-secondary-dark p-6 rounded-lg flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Latest Signals</h3>
                        <RotatingArrowButton text="" />
                    </div>
                    <ul className="text-sm mt-4 space-y-3">
                        <li>AAVE/USDT | <span className="text-green-500">Active</span></li>
                        <li>ETH/USDT | <span className="text-red-500">Closed</span></li>
                        <li>BTC/USDT | <span className="text-green-500">Active</span></li>
                    </ul>
                </Link>
                <div className="bg-opc-secondary-dark p-6 rounded-lg flex-1">
                    <h3 className="text-lg font-semibold">Announcements</h3>
                    <ul className="text-sm text-gray-300 mt-4 space-y-3">
                        <li>June Subscription converted to July</li>
                        <li>Bi-weekly calls on Wednesday & Sunday</li>
                    </ul>
                </div>
            </div>
          </div>

        </div>
      </main>
      </div>
  );
}

// Export the dashboard component directly since we'll handle auth in a different way
export default MemberDashboard;
