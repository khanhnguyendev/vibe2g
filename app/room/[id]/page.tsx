'use client';

import { Navbar } from '@/components/layout/Navbar';
import { VideoPlayer } from '@/components/room/VideoPlayer';
import { ChatSidebar } from '@/components/room/ChatSidebar';
import { Queue } from '@/components/room/Queue';
import { useRoom } from '@/hooks/useRoom';
import { useState, useEffect, useMemo, use } from 'react';
import { SearchBar } from '@/components/room/SearchBar';
import { SearchResults } from '@/components/room/SearchResults';
import { Users } from 'lucide-react';
import { EntryModal } from '@/components/room/EntryModal';
import { extractVideoId, fetchOEmbedInfo, searchYouTube } from '@/lib/youtube';

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
        transferHost
    } = useRoom(params.id, userDisplayName || 'Joining...');

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [previewVideo, setPreviewVideo] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setSearchError(null);
        const videoId = extractVideoId(query);

        if (videoId) {
            const info = await fetchOEmbedInfo(videoId);
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
            updateVideoState({
                current_video_id: video.id,
                current_title: video.title,
                current_thumbnail: video.thumbnail,
                is_playing: true,
            });
        } else {
            addToQueue({
                video_id: video.id,
                title: video.title,
                thumbnail: video.thumbnail,
                added_by: userDisplayName
            });
        }
    };

    const handlePlayFromQueue = (video: any) => {
        if (!isHost) return;
        updateVideoState({
            current_video_id: video.video_id,
            current_title: video.title,
            current_thumbnail: video.thumbnail,
            is_playing: true,
        });
        removeFromQueue(video.id);
    };

    const handleVideoEnd = () => {
        if (queue.length > 0) {
            handlePlayFromQueue(queue[0]);
        } else {
            updateVideoState({
                current_video_id: null,
                current_title: null,
                current_thumbnail: null,
                is_playing: false,
            });
        }
    };

    return (
        <div className="h-screen bg-brand-dark flex flex-col overflow-hidden">
            <Navbar
                roomName={roomName}
                userDisplayName={userDisplayName}
                viewerCount={viewerCount}
                isHost={isHost}
            />

            {/* Main Layout */}
            <main className="flex-1 flex flex-col pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto w-full min-h-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">

                    {/* Left Column - Video Player & Search (Takes 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar relative">
                        <div className="sticky top-0 z-30 pb-2 bg-brand-dark/50 backdrop-blur-md -mx-2 px-2 pt-2">
                            <VideoPlayer
                                state={videoState}
                                onUpdate={updateVideoState}
                                onEnded={handleVideoEnd}
                                isHost={isHost}
                            />
                        </div>

                        {/* Search Section */}
                        <div className="glass rounded-2xl p-6">
                            <SearchBar onSearch={handleSearch} />
                            <SearchResults
                                results={searchResults}
                                onAdd={handleAddVideo}
                                onPreview={setPreviewVideo}
                                onClear={() => setSearchResults([])}
                                isLoading={isSearching}
                                error={searchError}
                            />
                        </div>

                        {/* Queue Component */}
                        <div className="min-h-0">
                            <Queue
                                items={queue}
                                nowPlaying={{
                                    video_id: videoState.current_video_id,
                                    title: videoState.current_title,
                                    thumbnail: videoState.current_thumbnail,
                                }}
                                onPlay={handlePlayFromQueue}
                                onRemove={removeFromQueue}
                                isHost={isHost}
                            />
                        </div>
                    </div>

                    {/* Right Column - Chat (Takes 1 col) */}
                    <div className="lg:col-span-1 h-full min-h-0">
                        <ChatSidebar
                            messages={messages}
                            onSendMessage={sendMessage}
                            userName={userDisplayName}
                            activeUsers={activeUsers}
                            isHost={isHost}
                            hostId={hostId}
                            onTransferHost={transferHost}
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
