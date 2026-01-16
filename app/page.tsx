'use client';

import { Navbar } from '@/components/layout/Navbar';
import { ArrowRight, Users, Zap, Shield, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { EntryModal } from '@/components/room/EntryModal';
import { supabase } from '@/lib/supabase';
import { LiveRooms } from '@/components/room/LiveRooms';

export default function Home() {
  const router = useRouter();
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const handleEntryComplete = async ({ type, roomId, roomName, username }: { type: 'join' | 'create', roomId?: string, roomName?: string, username: string }) => {
    localStorage.setItem('vibe2g_username', username);

    // Ensure unique userId exists
    let userId = localStorage.getItem('vibe2g_user_id');
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('vibe2g_user_id', userId);
    }

    const params = new URLSearchParams();
    params.set('username', username);

    if (type === 'join') {
      toast.success(`Joining room ${roomId}...`);
      router.push(`/room/${roomId}?${params.toString()}`);
    } else {
      const generatedId = Math.random().toString(36).substring(2, 9);

      const createRoomPromise = (async () => {
        const { error } = await supabase.from('rooms').insert({
          id: generatedId,
          name: roomName || `Room: ${generatedId}`,
          host_id: userId,
        });
        if (error) throw error;
        return { generatedId, roomName };
      })();

      toast.promise(createRoomPromise, {
        loading: 'Creating your vibe room...',
        success: (data) => `Room "${data.roomName || data.generatedId}" created!`,
        error: 'Failed to create room'
      });

      try {
        await createRoomPromise;
        if (roomName) params.set('name', roomName);
        router.push(`/room/${generatedId}?${params.toString()}`);
      } catch (err) {
        console.error('Room creation error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-brand-dark text-white selection:bg-brand-violet/30">

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in duration-700">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-slate-300 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            v1.0 is now live
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none">
              Watch <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Together</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl md:text-2xl text-slate-400 leading-relaxed font-light">
              Experience YouTube like never before. Synchronized playback, real-time chat, and perfectly shared moments with your inner circle.
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsEntryModalOpen(true)}
              className="h-16 px-10 rounded-full bg-white text-slate-950 font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 flex items-center gap-3 group"
            >
              Start Vibing
              <Play className="h-5 w-5 fill-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        <EntryModal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          onComplete={(data) => {
            handleEntryComplete(data);
            setIsEntryModalOpen(false);
          }}
        />

        <div className="mt-20 w-full max-w-6xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <LiveRooms />
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
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
