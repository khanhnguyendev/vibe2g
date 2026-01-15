'use client';

import { Navbar } from '@/components/layout/Navbar';
import { ArrowRight, Users, Zap, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'join' | 'create'>('create');
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');

  // Load name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('vibe2g_username');
    if (savedName) setUserName(savedName);
  }, []);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !userName.trim()) return;

    // Save name
    localStorage.setItem('vibe2g_username', userName.trim());

    const params = new URLSearchParams();
    params.set('username', userName.trim());

    if (view === 'join') {
      router.push(`/room/${inputValue.trim()}?${params.toString()}`);
    } else {
      // Create Room - Generate ID and pass Name
      const roomId = Math.random().toString(36).substring(2, 9);
      params.set('name', inputValue.trim());
      router.push(`/room/${roomId}?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-brand-dark text-white selection:bg-brand-violet/30">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-slate-300 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            v1.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            Watch <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Together</span>, <br />
            Anywhere.
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed">
            The premium way to share moments. Watch YouTube in perfect sync with friends, in high-fidelity audio and zero latency.
          </p>

          {/* Join/Create Room Tabs */}
          <div className="pt-8 max-w-md mx-auto w-full space-y-4">

            {/* User Name Input */}
            <div className="relative flex items-center group">
              <div className="absolute left-5 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name..."
                className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all backdrop-blur-sm"
              />
            </div>

            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 relative backdrop-blur-sm">
              <button
                onClick={() => setView('join')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${view === 'join' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Join Room
              </button>
              <button
                onClick={() => setView('create')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${view === 'create' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Create Room
              </button>
            </div>

            <form onSubmit={handleAction} className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={view === 'join' ? "Enter Room ID..." : "Enter Room Name..."}
                className="w-full h-14 pl-6 pr-44 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={(view === 'join' && !inputValue.trim()) || !userName.trim()}
                className="absolute right-1 top-1 bottom-1 group inline-flex items-center justify-center rounded-full bg-slate-100 px-6 font-semibold text-slate-950 transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {view === 'join' ? 'Join Now' : 'Create'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-yellow-400" />}
            title="Zero Latency"
            description="Real-time synchronization ensures you laugh, monitor, and react at the exact same moment."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 text-blue-400" />}
            title="Social First"
            description="Built-in voice and text chat so you never miss a beat while watching your favorite content."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-green-400" />}
            title="Private Rooms"
            description="Create password-protected rooms for your inner circle. Your vibe, your rules."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 hover:bg-white/10 transition-colors duration-300">
      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-100">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}
