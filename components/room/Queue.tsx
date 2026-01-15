import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Video {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
}

const MOCK_QUEUE: Video[] = [
    { id: '1', title: 'Lofi Girl - beats to relax/study to', thumbnail: 'bg-indigo-900', duration: 'LIVE', author: 'Lofi Girl' },
    { id: '2', title: 'Next.js 15 Full Course', thumbnail: 'bg-black', duration: '4:20:30', author: 'Sonny Sangha' },
    { id: '3', title: 'Elden Ring - All Bosses', thumbnail: 'bg-amber-900', duration: '35:10', author: 'VaatiVidya' },
];

export function Queue() {
    return (
        <div className="flex-1 glass rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Up Next</h2>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-slate-300">Auto-play on</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {MOCK_QUEUE.map((video, idx) => (
                    <div key={video.id} className="group flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer pr-4">
                        {/* Thumbnail */}
                        <div className={cn("relative h-20 w-32 shrink-0 rounded-lg overflow-hidden", video.thumbnail)}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                            <span className="absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 bg-black/80 rounded text-white">
                                {video.duration}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center min-w-0">
                            <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-tight group-hover:text-violet-400 transition-colors">
                                {video.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">{video.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
