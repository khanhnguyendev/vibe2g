'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Users, Play, Music2 } from 'lucide-react';
import { toast } from 'sonner';

type Room = {
    id: string;
    name: string;
    current_title: string | null;
    current_thumbnail: string | null;
    current_channel_title: string | null;
    current_view_count: string | null;
    is_playing: boolean;
    created_at: string;
};

export function LiveRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRooms();

        // Subscribe to room changes for real-time list updates
        const channel = supabase.channel('public_rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                fetchRooms();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchRooms = async () => {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('is_public', true)
            .order('last_synced_at', { ascending: false })
            .limit(12);

        if (!error && data) {
            // Filter out empty/stale rooms if needed, but for now show all active ones
            setRooms(data);
        }
        setLoading(false);
    };

    const handleJoin = (roomId: string) => {
        // Check for username
        const username = localStorage.getItem('vibe2g_username');
        if (!username) {
            toast.error("Please set a username first by clicking 'Start Vibing'");
            return;
        }
        router.push(`/room/${roomId}?username=${username}`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-3xl bg-white/5 border border-white/5" />
                ))}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Music2 className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/50">No active rooms</h3>
                <p className="text-sm text-white/30">Be the first to start a vibe!</p>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <h2 className="text-2xl font-bold text-white">Live Rooms</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        onClick={() => handleJoin(room.id)}
                        className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10"
                    >
                        {/* Thumbnail Background */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                        {room.current_thumbnail ? (
                            <img
                                src={room.current_thumbnail}
                                alt={room.current_title || 'Room thumbnail'}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-black opacity-60" />
                        )}

                        {/* Content */}
                        <div className="relative z-20 p-6 h-full flex flex-col justify-end min-h-[200px]">
                            <div className="flex justify-between items-start absolute top-6 left-6 right-6">
                                <div className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-medium text-white/80">
                                    Room: {room.id}
                                </div>
                                {room.is_playing && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/20 text-xs font-bold text-red-200 uppercase tracking-wide">
                                        <Play className="h-3 w-3 fill-current" />
                                        <span>Now Playing</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
                                {room.current_title || room.name}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                {room.current_channel_title ? (
                                    <>
                                        <Music2 className="h-4 w-4" />
                                        <span className="truncate">{room.current_channel_title}</span>
                                    </>
                                ) : (
                                    <span className="text-white/40 italic">Lobby - Waiting for video</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
