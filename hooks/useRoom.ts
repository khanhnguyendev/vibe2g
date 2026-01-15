'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

type Message = {
    id: number;
    user_id: string;
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
    channel_title: string | null;
    view_count: string | null;
};

type NewQueueItem = Omit<QueueItem, 'id'>;

type RoomState = {
    current_video_id: string | null;
    current_title: string | null;
    current_thumbnail: string | null;
    current_channel_title: string | null;
    current_view_count: string | null;
    is_playing: boolean;
    playback_rate: number;
    last_synced_at: string;
    host_id: string | null;
};

export function useRoom(roomId: string, userName: string) {
    const [videoState, setVideoState] = useState<RoomState>({
        current_video_id: null,
        current_title: null,
        current_thumbnail: null,
        current_channel_title: null,
        current_view_count: null,
        is_playing: false,
        playback_rate: 1,
        last_synced_at: new Date().toISOString(),
        host_id: null,
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [viewerCount, setViewerCount] = useState(1);
    const [hostId, setHostId] = useState<string | null>(null);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const prevVideoIdRef = useRef<string | null>(null);
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
                    current_channel_title: room.current_channel_title || null,
                    current_view_count: room.current_view_count || null,
                    is_playing: room.is_playing,
                    playback_rate: room.playback_rate,
                    last_synced_at: room.last_synced_at,
                    host_id: room.host_id,
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
            .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
                newPresences.forEach((p: any) => {
                    if (p.user_id !== currentUserId) {
                        toast.info(`${p.user_name || 'Someone'} joined the room`, {
                            icon: '👋',
                        });
                    }
                });
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
                leftPresences.forEach((p: any) => {
                    toast.info(`${p.user_name || 'Someone'} left the room`, {
                        icon: '🚪',
                    });
                });
            })
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
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

                if (newRow.current_video_id !== prevVideoIdRef.current && newRow.current_video_id) {
                    // Only toast for others (The host who triggered it already has a toast)
                    if (newRow.host_id !== currentUserId) {
                        toast.success(`Now playing: ${newRow.current_title}`, { icon: '🎬' });
                    }
                }
                prevVideoIdRef.current = newRow.current_video_id;

                setVideoState({
                    current_video_id: newRow.current_video_id,
                    current_title: newRow.current_title,
                    current_thumbnail: newRow.current_thumbnail,
                    current_channel_title: newRow.current_channel_title,
                    current_view_count: newRow.current_view_count,
                    is_playing: newRow.is_playing,
                    playback_rate: newRow.playback_rate,
                    last_synced_at: newRow.last_synced_at,
                    host_id: newRow.host_id,
                });

                if (newRow.host_id !== hostId && newRow.host_id) {
                    const newHost = activeUsers.find(u => u.id === newRow.host_id);
                    if (newHost) {
                        toast.info(`${newHost.name} is now the host`, { icon: '👑' });
                    }
                }
                setHostId(newRow.host_id);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload: any) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'queue', filter: `room_id=eq.${roomId}` }, (payload) => {
                const newItem = payload.new as any;
                if (newItem.added_by !== userName) {
                    toast.success(`${newItem.added_by} added "${newItem.title}" to queue`, {
                        icon: '🎵',
                    });
                }
                supabase.from('queue').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
                    .then(({ data }) => {
                        if (data) {
                            setQueue(data as any);
                        }
                    });
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'queue', filter: `room_id=eq.${roomId}` }, (payload) => {
                supabase.from('queue').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
                    .then(({ data }) => {
                        if (data) {
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
        const newHost = activeUsers.find(u => u.id === newHostId);
        const promise = (async () => {
            const { error } = await supabase.from('rooms').update({ host_id: newHostId }).eq('id', roomId);
            if (error) throw error;
        })();

        toast.promise(promise, {
            loading: 'Transferring host...',
            success: `Host transferred to ${newHost?.name || 'new user'}`,
            error: 'Failed to transfer host'
        });
        await promise;
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || !currentUserId) return;
        await supabase.from('messages').insert({
            room_id: roomId,
            user_id: currentUserId,
            user_name: userName,
            content: content,
            color: 'bg-violet-500',
        });
    };

    const addToQueue = async (video: NewQueueItem) => {
        const promise = (async () => {
            const insertData = {
                room_id: roomId,
                video_id: video.video_id,
                title: video.title,
                thumbnail: video.thumbnail,
                added_by: userName,
                channel_title: video.channel_title,
                view_count: video.view_count,
            };

            const { data, error } = await supabase.from('queue').insert(insertData).select().single();

            if (error) throw error;
            if (data) {
                setQueue(prev => {
                    if (prev.find(item => item.id === data.id)) return prev;
                    return [...prev, data as QueueItem];
                });
                return data;
            }
        })();

        toast.promise(promise, {
            loading: 'Adding to queue...',
            success: (data: any) => `${data.added_by} added "${data.title}" to queue`,
            error: 'Failed to add to queue'
        });
    };

    const removeFromQueue = async (id: number, silent = false) => {
        const itemToRemove = queue.find(item => item.id === id);

        // Optimistic update
        setQueue(prev => prev.filter(item => item.id !== id));

        const promise = (async () => {
            const { error } = await supabase.from('queue').delete().eq('id', id);
            if (error) {
                // Rollback on error
                const { data } = await supabase.from('queue').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
                if (data) setQueue(data as any);
                throw error;
            }
        })();

        if (itemToRemove && !silent) {
            toast.promise(promise, {
                loading: 'Removing...',
                success: `Removed "${itemToRemove.title}" from queue`,
                error: 'Failed to remove from queue'
            });
        }
        return promise;
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
        transferHost,
        currentUserId
    };
}
