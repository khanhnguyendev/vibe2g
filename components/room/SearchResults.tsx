'use client';

import { Plus, Play, Info, Loader2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    duration: string;
}

interface SearchResultsProps {
    results: SearchResult[];
    onAdd: (video: SearchResult) => void;
    onPreview: (video: SearchResult) => void;
    onClear?: () => void;
    isLoading?: boolean;
    error?: string | null;
}

export function SearchResults({ results, onAdd, onPreview, onClear, isLoading, error }: SearchResultsProps) {
    if (isLoading) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center p-12 text-slate-500 animate-in fade-in duration-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-violet-500" />
                <p className="text-sm font-medium">Searching YouTube...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-6 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <h4 className="font-bold">Search Unavailable</h4>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                    {error}
                </p>
                <p className="text-[10px] mt-4 opacity-50 uppercase tracking-widest font-bold">
                    Tip: Direct YouTube links still work even if search is down!
                </p>
            </div>
        );
    }

    if (results.length === 0) return null;

    return (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Results</h3>
                {onClear && (
                    <button
                        onClick={onClear}
                        className="text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((video) => (
                    <div
                        key={video.id}
                        className="group relative flex gap-4 p-4 glass rounded-2xl hover:bg-white/10 transition-all border border-white/5 cursor-pointer"
                    >
                        {/* Thumbnail */}
                        <div className="relative h-24 w-40 shrink-0 rounded-xl overflow-hidden bg-slate-800 shadow-lg">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPreview(video); }}
                                    className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors"
                                >
                                    <Play className="h-4 w-4 text-white fill-white" />
                                </button>
                            </div>
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-bold text-white rounded">
                                {video.duration}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                            <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-tight mb-1 group-hover:text-violet-400 transition-colors">
                                    {video.title}
                                </h4>
                                <p className="text-xs text-slate-500 truncate">{video.channelTitle}</p>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(video); }}
                                className="flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add to Queue</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
