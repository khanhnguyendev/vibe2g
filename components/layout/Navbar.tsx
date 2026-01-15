import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Play, Users, User, Crown } from 'lucide-react';

interface NavbarProps {
    roomName?: string;
    userDisplayName?: string;
    viewerCount?: number;
    isHost?: boolean;
}

export function Navbar({ roomName, userDisplayName, viewerCount, isHost }: NavbarProps) {
    return (
        <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
            <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/20">
                            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">vibe2g</span>
                    </Link>

                    {roomName && (
                        <div className="hidden md:flex items-center gap-3 pl-6 border-l border-white/10">
                            <h2 className="text-sm font-bold text-white truncate max-w-[200px]">{roomName}</h2>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    {userDisplayName ? (
                        <>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                {isHost ? (
                                    <Crown className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400/20" />
                                ) : (
                                    <User className="h-3.5 w-3.5 text-violet-400" />
                                )}
                                <span className="text-xs font-semibold text-slate-300">{userDisplayName}</span>
                            </div>

                            {viewerCount !== undefined && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-full border border-violet-500/20">
                                    <Users className="h-3.5 w-3.5 text-violet-400" />
                                    <span className="text-xs font-bold text-violet-400">{viewerCount} online</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-widest">
                            Real-time YouTube Sync
                        </span>
                    )}
                </div>
            </div>
        </nav>
    );
}
