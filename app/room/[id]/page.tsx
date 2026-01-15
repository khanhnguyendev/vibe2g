'use client';

import { Navbar } from '@/components/layout/Navbar';
import { VideoPlayer } from '@/components/room/VideoPlayer';
import { ChatSidebar } from '@/components/room/ChatSidebar';
import { Queue } from '@/components/room/Queue';
import { useRoom } from '@/hooks/useRoom';
import { useState, useMemo } from 'react';

export default function RoomPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { name?: string }
}) {
    const roomName = searchParams.name || `Room: ${params.id}`;

    // Simple persistent guest name for this session
    const guestName = useMemo(() => `Guest ${Math.floor(Math.random() * 9000) + 1000}`, []);

    const {
        videoState,
        messages,
        queue,
        updateVideoState,
        sendMessage,
        addToQueue
    } = useRoom(params.id, guestName);

    return (
        <div className="h-screen bg-brand-dark flex flex-col overflow-hidden">
            <Navbar />

            {/* Main Layout */}
            <main className="flex-1 flex flex-col pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto w-full min-h-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">

                    {/* Left Column - Video Player (Takes 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        <VideoPlayer
                            state={videoState}
                            onUpdate={updateVideoState}
                        />

                        {/* Video Info / Queue */}
                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                            <div className="glass rounded-2xl p-6 shrink-0">
                                <h2 className="text-2xl font-bold text-white mb-2">{roomName}</h2>
                                <p className="text-slate-400">Viewing as <span className="text-violet-400 font-semibold">{guestName}</span></p>
                            </div>

                            {/* Queue Component */}
                            <div className="flex-1 min-h-0">
                                <Queue
                                    items={queue}
                                    onAdd={addToQueue}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Chat (Takes 1 col) */}
                    <div className="lg:col-span-1 h-full min-h-0">
                        <ChatSidebar
                            messages={messages}
                            onSendMessage={sendMessage}
                            userName={guestName}
                        />
                    </div>

                </div>
            </main>
        </div>
    );
}
