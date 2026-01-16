'use client';

import { useState, useEffect } from 'react';
import { User, ArrowRight, X, Play, Plus, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface EntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: { type: 'join' | 'create', roomId?: string, roomName?: string, username: string }) => void;
    mode?: 'full' | 'name-only';
}

export function EntryModal({ isOpen, onClose, onComplete, mode = 'full' }: EntryModalProps) {
    const [view, setView] = useState<'join' | 'create'>('create');
    const [roomInput, setRoomInput] = useState('');
    const [userName, setUserName] = useState('');
    const [step, setStep] = useState<'info' | 'name'>(mode === 'full' ? 'info' : 'name');

    // Live Rooms State
    const [rooms, setRooms] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            const savedName = localStorage.getItem('vibe2g_username');
            if (savedName) setUserName(savedName);
            setStep(mode === 'full' ? 'info' : 'name');
            setRoomInput('');
            fetchRooms();
        }
    }, [isOpen, mode]);

    const fetchRooms = async () => {
        const { data } = await supabase
            .from('rooms')
            .select('*')
            .eq('is_public', true)
            .order('last_synced_at', { ascending: false })
            .limit(6);
        if (data) setRooms(data);
    };

    if (!isOpen) return null;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomInput.trim()) return;

        if (userName.trim()) {
            finish();
        } else {
            setStep('name');
        }
    };

    const handleRoomSelect = (roomId: string) => {
        setRoomInput(roomId);
        if (userName.trim()) {
            // If we have a name, go straight to finish
            localStorage.setItem('vibe2g_username', userName.trim());
            onComplete({
                type: 'join',
                roomId: roomId,
                username: userName.trim()
            });
        } else {
            // Otherwise ask for name
            setStep('name');
        }
    };

    const finish = () => {
        localStorage.setItem('vibe2g_username', userName.trim());
        onComplete({
            type: view,
            roomId: view === 'join' ? roomInput.trim() : undefined,
            roomName: view === 'create' ? roomInput.trim() : undefined,
            username: userName.trim()
        });
    };

    const handleFinish = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim()) {
            finish();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`glass-card w-full ${view === 'join' && step === 'info' ? 'max-w-4xl' : 'max-w-md'} overflow-hidden rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 transition-all`}>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-violet-600/20 flex items-center justify-center ring-1 ring-violet-500/20">
                            {step === 'info' ? (
                                view === 'join' ? <Hash className="h-6 w-6 text-violet-400" /> : <Plus className="h-6 w-6 text-violet-400" />
                            ) : (
                                <User className="h-6 w-6 text-violet-400" />
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {step === 'info' ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">
                                    {view === 'join' ? 'Join a Room' : 'Create a Room'}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    {view === 'join'
                                        ? 'Enter a room ID or select a live room below.'
                                        : 'Give your room a name and invite friends to watch together.'
                                    }
                                </p>
                            </div>

                            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 relative backdrop-blur-sm max-w-md mx-auto">
                                <button
                                    onClick={() => setView('join')}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        view === 'join' ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    Join
                                </button>
                                <button
                                    onClick={() => setView('create')}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        view === 'create' ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    Create
                                </button>
                            </div>

                            <div className="max-w-md mx-auto">
                                <form onSubmit={handleNext} className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                                            {view === 'join' ? <Hash className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                        </div>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={roomInput}
                                            onChange={(e) => setRoomInput(e.target.value)}
                                            placeholder={view === 'join' ? "Enter Room ID..." : "Enter Room Name..."}
                                            className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!roomInput.trim()}
                                        className="w-full h-14 group inline-flex items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-950 transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {userName.trim() ? 'Enter Room' : 'Next Step'}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </div>

                            {/* Live Rooms List in Join View */}
                            {view === 'join' && (
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Now</h3>
                                    </div>

                                    {rooms.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {rooms.map((room) => (
                                                <div
                                                    key={room.id}
                                                    onClick={() => handleRoomSelect(room.id)}
                                                    className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                                                >
                                                    <div className="aspect-video relative bg-black">
                                                        {room.current_thumbnail ? (
                                                            <img
                                                                src={room.current_thumbnail}
                                                                alt={room.name}
                                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-black" />
                                                        )}
                                                        {room.is_playing && (
                                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-500/80 text-[10px] font-bold text-white uppercase flex items-center gap-1">
                                                                <Play className="h-2 w-2 fill-current" /> Live
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-violet-300 transition-colors">
                                                            {room.current_title || room.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                            <User className="h-3 w-3" /> {room.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                                <Play className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-300">No active rooms found</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Be the first to <button onClick={() => setView('create')} className="text-violet-400 hover:text-violet-300 underline font-medium">create one</button>!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">Almost there!</h2>
                                <p className="text-slate-400 text-sm">What should your friends call you in the room?</p>
                            </div>

                            <form onSubmit={handleFinish} className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Your Name..."
                                        className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep('info')}
                                        className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!userName.trim()}
                                        className="flex-[2] h-14 group inline-flex items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-950 transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Let's Go
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
