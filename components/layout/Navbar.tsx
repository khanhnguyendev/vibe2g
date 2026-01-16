import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Play, Users, User, Crown, Share2, Copy } from 'lucide-react';

interface NavbarProps {
    roomName?: string;
    roomId?: string;
    userDisplayName?: string;
    isHost?: boolean;
    onShare?: () => void;
}

export function Navbar({ roomName, roomId, userDisplayName, isHost, onShare }: NavbarProps) {
    return (
        <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
            <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {roomName && (
                        <div className="flex items-center gap-3 pl-6 ml-2 border-l border-white/10 h-8">
                            <h1 className="font-bold text-white text-lg tracking-tight truncate max-w-[150px] sm:max-w-[300px]" title={roomName}>
                                {roomName}
                            </h1>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    {onShare && (
                        <button
                            onClick={onShare}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-semibold text-slate-300 hover:text-white"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </button>
                    )}

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
