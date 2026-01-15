'use client';

import { Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QueueItem = {
    id: number;
    video_id: string;
    title: string;
    thumbnail: string;
    added_by: string;
};

interface QueueProps {
    items: QueueItem[];
    onPlay: (item: QueueItem) => void;
    onRemove: (id: number) => void;
    isHost?: boolean;
}

export function Queue({ items, onPlay, onRemove, isHost }: QueueProps) {
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
                        <div
                            key={video.id}
                            onClick={() => isHost && onPlay(video)}
                            className={cn(
                                "group flex gap-3 p-2 rounded-xl transition-colors pr-4",
                                isHost ? "hover:bg-white/5 cursor-pointer" : "cursor-default"
                            )}
                        >
                            {/* Thumbnail */}
                            <div className={cn("relative h-20 w-32 shrink-0 rounded-lg overflow-hidden bg-slate-800 shadow-md")}>
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-violet-900/20">
                                        <Play className="h-6 w-6 text-violet-400" />
                                    </div>
                                )}
                                {isHost && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                        <Play className="h-6 w-6 text-white fill-white" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex flex-col justify-center min-w-0 flex-1">
                                <h3 className={cn(
                                    "text-sm font-medium text-slate-200 line-clamp-2 leading-tight transition-colors",
                                    isHost && "group-hover:text-violet-400"
                                )}>
                                    {video.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Added by {video.added_by}</p>
                            </div>

                            {/* Actions */}
                            {isHost && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(video.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 text-slate-500 rounded-lg transition-all self-center"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
