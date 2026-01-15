'use client';

import { Search, X, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { extractVideoId } from '@/lib/youtube';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const videoId = extractVideoId(query);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <div className="relative">
                {videoId ? (
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-400 animate-pulse" />
                ) : (
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                )}
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={videoId ? "YouTube Video Detected! Press Enter" : "Search YouTube or paste link..."}
                    className={cn(
                        "pl-12 pr-10 py-6 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all text-lg",
                        videoId && "ring-2 ring-violet-500/50 bg-violet-500/5"
                    )}
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:text-white text-slate-500 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </form>
    );
}
