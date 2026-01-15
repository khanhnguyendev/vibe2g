'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type Message = {
    id: number;
    user_name: string;
    content: string;
    color: string;
    created_at: string;
};

type QueueItem = {
    id: number;
    video_id: string;
    title: string;
    thumbnail: string;
    added_by: string;
};

type NewQueueItem = Omit<QueueItem, 'id'>;

type RoomState = {
    current_video_id: string;
    is_playing: boolean;
    playback_rate: number;
    last_synced_at: string;
};

export function useRoom(roomId: string, userName: string) {
    const [videoState, setVideoState] = useState<RoomState>({
        current_video_id: 'Hu4Yvq-g7_Y',
        is_playing: false,
        playback_rate: 1,
        last_synced_at: new Date().toISOString(),
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [viewerCount, setViewerCount] = useState(1);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Initial Fetch & Subscribe
    useEffect(() => {
        if (!roomId) return;

        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: userName,
                },
            },
        });

        const fetchInitialState = async () => {
            // ... (keep same fetch state logic)
            // Note: I'll include the logic below for completeness in the chunk
        };

        // Presence Logic
        (channel as any)
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                setViewerCount(Object.keys(newState).length);
            })
            .on('presence', { event: 'join', filter: { event: 'sync' } }, ({ newPresences }: any) => {
                console.log('User joined', newPresences);
            })
            .on('presence', { event: 'leave', filter: { event: 'sync' } }, ({ leftPresences }: any) => {
                console.log('User left', leftPresences);
            });

        // Postgres Changes
        channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload: any) => {
                const newRow = payload.new;
                setVideoState({
                    current_video_id: newRow.current_video_id,
                    is_playing: newRow.is_playing,
                    playback_rate: newRow.playback_rate,
                    last_synced_at: newRow.last_synced_at,
                });
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload: any) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'queue', filter: `room_id=eq.${roomId}` }, () => {
                supabase.from('queue').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
                    .then(({ data }) => {
                        if (data) setQueue(data as any);
                    });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                }
            });

        channelRef.current = channel;

        // Fetch initial state logic (wrapped to avoid closure issues)
        const fetchState = async () => {
            const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).single();
            if (room) {
                setVideoState({
                    current_video_id: room.current_video_id || 'Hu4Yvq-g7_Y',
                    is_playing: room.is_playing,
                    playback_rate: room.playback_rate,
                    last_synced_at: room.last_synced_at,
                });
            }
            const { data: thread } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
            if (thread) setMessages(thread as any);
            const { data: q } = await supabase.from('queue').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
            if (q) setQueue(q as any);
        };
        fetchState();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, userName]);

    // ... (rest of actions)

    // Actions
    const updateVideoState = async (updates: Partial<RoomState>) => {
        await supabase.from('rooms').update({
            ...updates,
            last_synced_at: new Date().toISOString()
        }).eq('id', roomId);
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;
        await supabase.from('messages').insert({
            room_id: roomId,
            user_name: userName, // Pass this in or managing auth?
            content: content,
            color: 'bg-violet-500', // Randomize later
        });
    };

    const addToQueue = async (video: NewQueueItem) => {
        await supabase.from('queue').insert({
            room_id: roomId,
            video_id: video.video_id,
            title: video.title,
            thumbnail: video.thumbnail,
            added_by: userName,
        });
    };

    const removeFromQueue = async (id: number) => {
        await supabase.from('queue').delete().eq('id', id);
    };

    return {
        videoState,
        messages,
        queue,
        viewerCount,
        updateVideoState,
        sendMessage,
        addToQueue,
        removeFromQueue
    };
}
