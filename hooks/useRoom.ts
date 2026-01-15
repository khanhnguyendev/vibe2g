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
    current_video_id: string | null;
    current_title: string | null;
    current_thumbnail: string | null;
    is_playing: boolean;
    playback_rate: number;
    last_synced_at: string;
};

export function useRoom(roomId: string, userName: string) {
    const [videoState, setVideoState] = useState<RoomState>({
        current_video_id: null,
        current_title: null,
        current_thumbnail: null,
        is_playing: false,
        playback_rate: 1,
        last_synced_at: new Date().toISOString(),
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [viewerCount, setViewerCount] = useState(1);
    const [hostId, setHostId] = useState<string | null>(null);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('vibe2g_user_id');
        if (!storedId) {
            const newId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('vibe2g_user_id', newId);
            setCurrentUserId(newId);
        } else {
            setCurrentUserId(storedId);
        }
    }, []);

    const isHost = currentUserId === hostId;

    // Initial Fetch & Subscribe
    useEffect(() => {
        if (!roomId || !currentUserId) return;

        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: currentUserId,
                },
            },
        });

        const fetchState = async () => {
            const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).single();
            if (room) {
                setVideoState({
                    current_video_id: room.current_video_id || null,
                    current_title: room.current_title || null,
                    current_thumbnail: room.current_thumbnail || null,
                    is_playing: room.is_playing,
                    playback_rate: room.playback_rate,
                    last_synced_at: room.last_synced_at,
                });
                setHostId(room.host_id);
            }
            const { data: thread } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
            if (thread) setMessages(thread as any);
            const { data: q } = await supabase.from('queue').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
            if (q) setQueue(q as any);
        };

        // Presence Logic
        (channel as any)
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const users = Object.values(newState).flat().map((p: any) => ({
                    id: p.presence_ref, // Using presence_ref or we can add custom payload
                    name: p.user_name || 'Guest',
                    userId: p.user_id
                }));
                // Presence state keys are our currentUserId
                const active = Object.keys(newState).map(key => {
                    const presence = newState[key][0] as any;
                    return {
                        id: key,
                        name: presence.user_name,
                        online_at: presence.online_at
                    };
                });
                setActiveUsers(active);
                setViewerCount(active.length);
            });

        // Postgres Changes
        channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload: any) => {
                const newRow = payload.new;
                setVideoState({
                    current_video_id: newRow.current_video_id,
                    current_title: newRow.current_title,
                    current_thumbnail: newRow.current_thumbnail,
                    is_playing: newRow.is_playing,
                    playback_rate: newRow.playback_rate,
                    last_synced_at: newRow.last_synced_at,
                });
                setHostId(newRow.host_id);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload: any) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'queue', filter: `room_id=eq.${roomId}` }, (payload) => {
                console.log('useRoom: Queue changed!', payload);
                supabase.from('queue').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
                    .then(({ data }) => {
                        if (data) {
                            console.log('useRoom: Refetched queue', data.length);
                            setQueue(data as any);
                        }
                    });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: currentUserId,
                        user_name: userName,
                        online_at: new Date().toISOString()
                    });
                }
            });

        channelRef.current = channel;
        fetchState();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, userName, currentUserId]);

    // Actions
    const updateVideoState = async (updates: Partial<RoomState>) => {
        console.log('useRoom: updateVideoState called', updates);
        const { error } = await supabase.from('rooms').update({
            ...updates,
            last_synced_at: new Date().toISOString()
        }).eq('id', roomId);

        if (error) {
            console.error('useRoom: Failed to update video state', error);
        }
    };

    const transferHost = async (newHostId: string) => {
        if (!isHost) return;
        await supabase.from('rooms').update({ host_id: newHostId }).eq('id', roomId);
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;
        await supabase.from('messages').insert({
            room_id: roomId,
            user_name: userName,
            content: content,
            color: 'bg-violet-500',
        });
    };

    const addToQueue = async (video: NewQueueItem) => {
        console.log('useRoom: addToQueue start', video);
        const insertData = {
            room_id: roomId,
            video_id: video.video_id,
            title: video.title,
            thumbnail: video.thumbnail,
            added_by: userName,
        };
        console.log('useRoom: Attempting insert', insertData);

        const { data, error } = await supabase.from('queue').insert(insertData).select().single();

        if (error) {
            console.error('useRoom: Failed to add to queue - SQL error', error);
        } else if (data) {
            console.log('useRoom: Successfully added to queue DB', data);
            // Optimistic update to avoid waiting for Realtime
            setQueue(prev => {
                if (prev.find(item => item.id === data.id)) return prev;
                return [...prev, data as QueueItem];
            });
        } else {
            console.warn('useRoom: insert succeeded but returned no data');
        }
    };

    const removeFromQueue = async (id: number) => {
        await supabase.from('queue').delete().eq('id', id);
    };

    return {
        videoState,
        messages,
        queue,
        viewerCount,
        isHost,
        hostId,
        activeUsers,
        updateVideoState,
        sendMessage,
        addToQueue,
        removeFromQueue,
        transferHost
    };
}
