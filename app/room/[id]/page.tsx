import { Navbar } from '@/components/layout/Navbar';
import { VideoPlayer } from '@/components/room/VideoPlayer';
import { ChatSidebar } from '@/components/room/ChatSidebar';
import { Queue } from '@/components/room/Queue';

export default function RoomPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <Navbar />

            {/* Main Layout */}
            <main className="flex-1 pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:h-[calc(100vh-8rem)] h-auto">

                    {/* Left Column - Video Player (Takes 3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <VideoPlayer />

                        {/* Video Info / Queue */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="glass rounded-2xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Cyberpunk 2077 - Phantom Liberty Trailer</h2>
                                <p className="text-slate-400">Viewing with 2 others</p>
                            </div>

                            {/* Queue Component */}
                            <Queue />
                        </div>
                    </div>

                    {/* Right Column - Chat (Takes 1 col) */}
                    <div className="lg:col-span-1 h-[600px] lg:h-full">
                        <ChatSidebar />
                    </div>

                </div>
            </main>
        </div>
    );
}
