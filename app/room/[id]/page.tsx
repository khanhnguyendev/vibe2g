'use client';

import { Navbar } from '@/components/layout/Navbar';
import { VideoPlayer } from '@/components/room/VideoPlayer';
import { ChatSidebar } from '@/components/room/ChatSidebar';
import { Queue } from '@/components/room/Queue';
import { useRoom } from '@/hooks/useRoom';
import { useState, useEffect, useMemo } from 'react';
import { SearchBar } from '@/components/room/SearchBar';
import { SearchResults } from '@/components/room/SearchResults';
import { Users } from 'lucide-react';
import { NameModal } from '@/components/room/NameModal';

export default function RoomPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { name?: string, username?: string }
}) {
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
        updateVideoState,
        sendMessage,
        addToQueue,
        removeFromQueue
    } = useRoom(params.id, userDisplayName || 'Joining...');

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [previewVideo, setPreviewVideo] = useState<any>(null);

    const handleSearch = async (query: string) => {
        // Mocking YouTube Search Results
        const mockResults = [
            { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio 💤 beats to sleep/chill to', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hq720.jpg', channelTitle: 'Lofi Girl', duration: 'LIVE' },
            { id: '5qap5aO4i9A', title: 'lofi hip hop radio - beats to relax/study to', thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hq720.jpg', channelTitle: 'Lofi Girl', duration: 'LIVE' },
            { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg', channelTitle: 'Rick Astley', duration: '3:33' },
            { id: 'hTWKbfoikeg', title: 'Nirvana - Smells Like Teen Spirit (Official Music Video)', thumbnail: 'https://i.ytimg.com/vi/hTWKbfoikeg/hq720.jpg', channelTitle: 'Nirvana', duration: '4:38' },
        ];
        setSearchResults(mockResults);
    };

    const handleAddVideo = (video: any) => {
        addToQueue({
            video_id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            added_by: userDisplayName
        });
        setSearchResults([]); // Clear search after adding
    };

    return (
        <div className="h-screen bg-brand-dark flex flex-col overflow-hidden">
            <Navbar />

            {/* Main Layout */}
            <main className="flex-1 flex flex-col pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto w-full min-h-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">

                    {/* Left Column - Video Player & Search (Takes 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        <VideoPlayer
                            state={videoState}
                            onUpdate={updateVideoState}
                        />

                        {/* Search Section */}
                        <div className="glass rounded-2xl p-6">
                            <SearchBar onSearch={handleSearch} />
                            <SearchResults
                                results={searchResults}
                                onAdd={handleAddVideo}
                                onPreview={setPreviewVideo}
                            />
                        </div>

                        {/* Video Info / Queue */}
                        <div className="flex flex-col gap-4 min-h-0">
                            <div className="glass rounded-2xl p-6 shrink-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">{roomName}</h2>
                                        <p className="text-slate-400">Viewing as <span className="text-violet-400 font-semibold">{userDisplayName}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full border border-white/10">
                                        <Users className="h-4 w-4 text-violet-400" />
                                        <span className="text-sm font-bold text-white">{viewerCount} online</span>
                                    </div>
                                </div>
                            </div>

                            {/* Queue Component */}
                            <div className="min-h-0">
                                <Queue
                                    items={queue}
                                    onAdd={handleAddVideo}
                                    onRemove={removeFromQueue}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Chat (Takes 1 col) */}
                    <div className="lg:col-span-1 h-full min-h-0">
                        <ChatSidebar
                            messages={messages}
                            onSendMessage={sendMessage}
                            userName={userDisplayName}
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
            <NameModal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                onSave={(name) => {
                    setUserDisplayName(name);
                    setIsNameModalOpen(false);
                }}
            />
        </div>
    );
}
