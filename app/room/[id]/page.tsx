'use client';

import { Navbar } from '@/components/layout/Navbar';
import { VideoPlayer } from '@/components/room/VideoPlayer';
import { ChatSidebar } from '@/components/room/ChatSidebar';
import { Queue } from '@/components/room/Queue';
import { useRoom } from '@/hooks/useRoom';
import { useState, useEffect, useMemo, use, useRef } from 'react';
import { SearchBar } from '@/components/room/SearchBar';
import { SearchResults } from '@/components/room/SearchResults';
import { Users, Eye, Music2 } from 'lucide-react';
import { EntryModal } from '@/components/room/EntryModal';
import { extractVideoId, fetchVideoDetails, searchYouTube } from '@/lib/youtube';
import { toast } from 'sonner';

export default function RoomPage({
    params: paramsPromise,
    searchParams: searchParamsPromise
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ name?: string, username?: string }>
}) {
    const params = use(paramsPromise);
    const searchParams = use(searchParamsPromise);

    const roomName = searchParams.name || `Room: ${params.id}`;

    // Resolve user name: URL param -> LocalStorage -> Trigger Modal
    const [userDisplayName, setUserDisplayName] = useState<string>('');
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);

    useEffect(() => {
        const urlUsername = searchParams.username;
        const storedUsername = localStorage.getItem('vibe2g_username');

        if (urlUsername) {
            setUserDisplayName(urlUsername);
            localStorage.setItem('vibe2g_username', urlUsername); // Sync to storage
        } else if (storedUsername) {
            setUserDisplayName(storedUsername);
        } else {
            // No name found, trigger modal
            setIsNameModalOpen(true);
        }
    }, [searchParams.username]);

    const {
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
    } = useRoom(params.id, userDisplayName || 'Joining...');

    const queueRef = useRef(queue);
    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [previewVideo, setPreviewVideo] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const getUserColor = (name: string) => {
        const colors = [
            'bg-violet-500',
            'bg-emerald-500',
            'bg-blue-500',
            'bg-pink-500',
            'bg-orange-500',
            'bg-indigo-500',
            'bg-cyan-500',
            'bg-rose-500',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setSearchError(null);
        const videoId = extractVideoId(query);

        if (videoId) {
            const info = await fetchVideoDetails(videoId);
            if (info) {
                setSearchResults([info]);
                setIsSearching(false);
                return;
            }
        }

        const results = await searchYouTube(query);
        if (results.length === 0 && query.trim()) {
            setSearchError("The YouTube Search API returned no results or is currently restricted. Please check your API Key settings in the Google Cloud Console.");
        }
        setSearchResults(results);
        setIsSearching(false);
    };

    const handleAddVideo = (video: any) => {
        if (!video?.id) return;

        if (!videoState.current_video_id) {
            const promise = updateVideoState({
                current_video_id: video.id,
                current_title: video.title,
                current_thumbnail: video.thumbnail,
                current_channel_title: video.channelTitle,
                current_view_count: video.viewCount,
                is_playing: true,
            });

            toast.promise(promise, {
                loading: 'Starting video...',
                success: `Playing "${video.title}"`,
                error: 'Failed to start video'
            });
        } else {
            addToQueue({
                video_id: video.id,
                title: video.title,
                thumbnail: video.thumbnail,
                added_by: userDisplayName,
                channel_title: video.channelTitle,
                view_count: video.viewCount,
            });
        }
    };

    const handlePlayFromQueue = async (video: any) => {
        console.log('RoomPage: handlePlayFromQueue called', { video, isHost });
        if (!isHost) {
            console.warn('RoomPage: Not the host, skipping play transition');
            return;
        }
        const promise = updateVideoState({
            current_video_id: video.video_id,
            current_title: video.title,
            current_thumbnail: video.thumbnail,
            current_channel_title: video.channel_title,
            current_view_count: video.view_count,
            is_playing: true,
        });

        toast.promise(promise, {
            loading: 'Transitioning...',
            success: `Playing "${video.title}"`,
            error: 'Failed to transition'
        });

        await removeFromQueue(video.id, true);
    };

    const handleVideoEnd = () => {
        const currentQueue = queueRef.current;
        console.log('RoomPage: handleVideoEnd called', { queueLength: currentQueue.length, isHost });

        if (currentQueue.length > 0) {
            console.log('RoomPage: Transitioning to next song in queue');
            handlePlayFromQueue(currentQueue[0]);
        } else {
            console.log('RoomPage: Queue empty, clearing player state');
            if (isHost) {
                updateVideoState({
                    current_video_id: null,
                    current_title: null,
                    current_thumbnail: null,
                    is_playing: false,
                });
            }
        }
    };

    return (
        <div className="h-screen bg-brand-dark flex flex-col overflow-hidden">
            <Navbar
                roomName={roomName}
                userDisplayName={userDisplayName}
                isHost={isHost}
            />

            {/* Main Layout */}
            <main className="flex-1 flex flex-col pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto w-full min-h-0">
                <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-12 gap-6 h-full min-h-0">

                    {/* Main Content Area - Video Player & Now Playing info */}
                    <div className="lg:col-span-3 xl:col-span-8 flex flex-col gap-6 min-h-0">
                        <div className="max-w-5xl w-full mx-auto">
                            <VideoPlayer
                                state={videoState}
                                onUpdate={updateVideoState}
                                onEnded={handleVideoEnd}
                                onNext={handleVideoEnd}
                                isHost={isHost}
                                hasNext={queue.length > 0}
                            />
                        </div>

                        {/* Video Info Card */}
                        <div className="glass rounded-3xl p-6 border border-white/5 bg-white/[0.02] backdrop-blur-md">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider border border-violet-500/20">
                                        Now Playing
                                    </span>
                                    {videoState.current_channel_title && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-white/5">
                                            <Music2 className="h-3 w-3" />
                                            {videoState.current_channel_title}
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold text-white line-clamp-2 leading-tight">
                                    {videoState.current_title || 'Waiting for a video...'}
                                </h1>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-white/5 mt-auto">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                                        <span>Live Sync Mode</span>
                                    </div>

                                    {videoState.current_view_count && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                            <Eye className="h-4 w-4 text-slate-500" />
                                            <span>{Number(videoState.current_view_count).toLocaleString()} views</span>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unified Sidebar - Search, Queue, Chat, Users */}
                    <div className="lg:col-span-2 xl:col-span-4 h-full min-h-0">
                        <ChatSidebar
                            messages={messages}
                            onSendMessage={sendMessage}
                            userName={userDisplayName}
                            currentUserId={currentUserId}
                            activeUsers={activeUsers}
                            isHost={isHost}
                            hostId={hostId}
                            onTransferHost={transferHost}
                            // Unified Props
                            searchResults={searchResults}
                            onSearch={handleSearch}
                            isSearching={isSearching}
                            searchError={searchError}
                            onAddVideo={handleAddVideo}
                            onPreviewVideo={setPreviewVideo}
                            onClearSearch={() => setSearchResults([])}
                            queueItems={queue}
                            nowPlaying={{
                                video_id: videoState.current_video_id,
                                title: videoState.current_title,
                                thumbnail: videoState.current_thumbnail,
                            }}
                            onPlayFromQueue={handlePlayFromQueue}
                            onRemoveFromQueue={removeFromQueue}
                        />
                    </div>

                </div>
            </main>

            {/* Preview Modal */}
            {previewVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="aspect-video w-full bg-black">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${previewVideo.id}?autoplay=1`}
                                title="Video Preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-6 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{previewVideo.title}</h3>
                                <p className="text-slate-400 text-sm">{previewVideo.channelTitle}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPreviewVideo(null)}
                                    className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white font-semibold"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => { handleAddVideo(previewVideo); setPreviewVideo(null); }}
                                    className="px-6 py-2 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold shadow-lg shadow-violet-500/20"
                                >
                                    Add to Queue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Name Modal for direct link entries */}
            <EntryModal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                mode="name-only"
                onComplete={({ username }) => {
                    setUserDisplayName(username);
                    setIsNameModalOpen(false);
                }}
            />
        </div>
    );
}
