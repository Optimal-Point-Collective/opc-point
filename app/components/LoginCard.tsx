import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

interface LoginCardProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export default function LoginCard({ onSubmit, error, loading }: LoginCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <div className="w-full max-w-[575px] bg-[#121212] rounded-2xl shadow-[inset_0_0_0_0.5px_#7C7C7C] overflow-hidden flex flex-col">
      <div className="pt-16 pb-8 flex-1 flex flex-col">
        {/* Title and subtitle */}
        <div className="text-center">
            <h1 className="text-5xl font-semibold text-white">The Point</h1>
            <p className="mt-6 text-gray-400 font-light text-xl tracking-wide">Login with your OPC Passport</p>
        </div>
        
        {/* Form */}
        <div className="w-full mt-16 flex-1 flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-[98.5px]">
            {/* Passport Username Field */}
            <div className="mb-8">
              <label htmlFor="email" className="block text-base font-light text-white mb-3">
                Passport Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Image src="/passport.svg" alt="Passport Icon" width={24} height={24} />
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 box-border py-3 pl-12 pr-4 bg-[#0c0c0c] border-[0.5px] border-[#7C7C7C]/25 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#BDB7A9]"
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="mb-10">
              <label htmlFor="password" className="block text-base font-light text-white mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Image src="/password.svg" alt="Password Icon" width={24} height={24} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 box-border py-3 pl-12 pr-4 bg-[#0c0c0c] border-[0.5px] border-[#7C7C7C]/25 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#BDB7A9]"
                  required
                />
              </div>
            </div>
            
            {/* Login Button */}
            <div className="mb-6">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-12 box-border py-3 bg-[#BDB7A9] hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-black text-base font-semibold rounded-lg transition-colors border-[0.5px] border-[#7C7C7C]/25"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            
            {/* Error message */}
            {error && (
              <div className="text-red-400 text-sm text-center mb-4">{error}</div>
            )}
            
            {/* Account links */}
            <div className="text-left text-sm">
                <p className="text-gray-400 mb-3">
                    Don&apos;t have an account? 
                    <Link href="/passport/signup" className="text-[#BDB7A9] font-medium ml-2">Sign up</Link>
                </p>
                <p>
                    <Link href="/forgot-password" className="text-[#BDB7A9] font-medium">Forgot Password</Link>
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
