import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Play } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
            <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">vibe2g</span>
                </Link>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest hidden sm:block">
                        Real-time YouTube Sync
                    </span>
                </div>
            </div>
        </nav>
    );
}
