import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Play, Users, User, Crown } from 'lucide-react';

interface NavbarProps {
    roomName?: string;
    userDisplayName?: string;
    isHost?: boolean;
}

export function Navbar({ roomName, userDisplayName, isHost }: NavbarProps) {
    return (
        <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
            <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="group">
                        <img
                            src="/logo.png"
                            alt="vibe2g"
                            className="h-10 w-auto group-hover:scale-105 transition-transform"
                        />
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
