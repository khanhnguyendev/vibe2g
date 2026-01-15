'use client';

import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

type QueueItem = {
    id: number;
    video_id: string;
    title: string;
    thumbnail: string;
    added_by: string;
};

interface QueueProps {
    items: QueueItem[];
    onAdd: (item: any) => void;
}

export function Queue({ items, onAdd }: QueueProps) {
    return (
        <div className="flex-1 glass rounded-2xl p-6 flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Up Next</h2>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-slate-300">
                    {items.length} videos queued
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-sm">Queue is empty</p>
                        <p className="text-xs mt-1">Search or add videos to start</p>
                    </div>
                ) : (
                    items.map((video, idx) => (
                        <div key={video.id} className="group flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer pr-4">
                            {/* Thumbnail */}
                            <div className={cn("relative h-20 w-32 shrink-0 rounded-lg overflow-hidden bg-slate-800")}>
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-violet-900/20">
                                        <Play className="h-6 w-6 text-violet-400" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <Play className="h-6 w-6 text-white fill-white" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-col justify-center min-w-0">
                                <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-tight group-hover:text-violet-400 transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Added by {video.added_by}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
