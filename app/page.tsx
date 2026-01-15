import { Navbar } from '@/components/layout/Navbar';
import { ArrowRight, Users, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
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

          <div className="pt-8">
            <Link href="/room/demo">
              <button className="group relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-full transition-transform hover:scale-105 active:scale-95">
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/80 px-8 py-4 text-base font-semibold text-white backdrop-blur-3xl transition-all group-hover:bg-slate-950/70">
                  Create Room <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
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
