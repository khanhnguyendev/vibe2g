import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send, Smile, Users, MessageSquare, Shield, Crown, RefreshCw, Search as SearchIcon, ListMusic } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { Queue, QueueItem } from './Queue';

type Message = {
    id: number;
    user_name: string;
    content: string;
    color: string;
    created_at: string;
};

interface ChatSidebarProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    userName: string;
    activeUsers: any[];
    isHost: boolean;
    hostId: string | null;
    onTransferHost: (newHostId: string) => void;
    // New Props for Search/Queue
    searchResults: any[];
    onSearch: (query: string) => void;
    isSearching: boolean;
    searchError: string | null;
    onAddVideo: (video: any) => void;
    onPreviewVideo: (video: any) => void;
    onClearSearch: () => void;
    queueItems: QueueItem[];
    nowPlaying: any;
    onPlayFromQueue: (item: QueueItem) => void;
    onRemoveFromQueue: (id: number) => void;
}

export function ChatSidebar({
    messages,
    onSendMessage,
    userName,
    activeUsers,
    isHost,
    hostId,
    onTransferHost,
    searchResults,
    onSearch,
    isSearching,
    searchError,
    onAddVideo,
    onPreviewVideo,
    onClearSearch,
    queueItems,
    nowPlaying,
    onPlayFromQueue,
    onRemoveFromQueue
}: ChatSidebarProps) {
    const [view, setView] = useState<'search' | 'queue' | 'chat' | 'users'>('chat');
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (view === 'chat') scrollToBottom();
    }, [messages, view]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        onSendMessage(inputValue);
        setInputValue('');
    };

    return (
        <div className="flex h-full flex-col glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Header / Tabs */}
            <div className="p-2 border-b border-white/5 bg-white/5 backdrop-blur-xl">
                <div className="grid grid-cols-4 bg-black/20 p-1 rounded-xl items-center gap-1">
                    <button
                        onClick={() => setView('search')}
                        title="Search Videos"
                        className={cn(
                            "flex items-center justify-center p-2 rounded-lg transition-all",
                            view === 'search' ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <SearchIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setView('queue')}
                        title="Queue"
                        className={cn(
                            "flex items-center justify-center p-2 rounded-lg transition-all relative",
                            view === 'queue' ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <ListMusic className="h-4 w-4" />
                        {queueItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-violet-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-black">
                                {queueItems.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setView('chat')}
                        title="Chat"
                        className={cn(
                            "flex items-center justify-center p-2 rounded-lg transition-all relative",
                            view === 'chat' ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <MessageSquare className="h-4 w-4" />
                        {messages.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-violet-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-black">
                                {messages.length > 99 ? '99+' : messages.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setView('users')}
                        title="Participants"
                        className={cn(
                            "flex items-center justify-center p-2 rounded-lg transition-all relative",
                            view === 'users' ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        {activeUsers.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-black shadow-sm">
                                {activeUsers.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {view === 'search' && (
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                        <div className="mb-4">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Add Music</h2>
                            <SearchBar onSearch={onSearch} />
                        </div>
                        <SearchResults
                            results={searchResults}
                            onAdd={onAddVideo}
                            onPreview={onPreviewVideo}
                            onClear={onClearSearch}
                            isLoading={isSearching}
                            error={searchError}
                        />
                    </div>
                )}

                {view === 'queue' && (
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                        <Queue
                            items={queueItems}
                            nowPlaying={nowPlaying}
                            onPlay={onPlayFromQueue}
                            onRemove={onRemoveFromQueue}
                            isHost={isHost}
                        />
                    </div>
                )}

                {view === 'chat' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className={cn("h-8 w-8 shrink-0 rounded-full ring-2 ring-brand-dark flex items-center justify-center text-xs font-bold text-white shadow-lg", msg.color || 'bg-violet-500')}>
                                        {(msg.user_name?.[0] || 'G').toUpperCase()}
                                    </div>
                                    <div className="flex flex-col max-w-[85%]">
                                        <span className="text-xs text-slate-400 mb-1 ml-1 flex items-center gap-2">
                                            {msg.user_name === userName ? 'You' : msg.user_name}
                                            <span className="text-[10px] opacity-50">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </span>
                                        <div className="px-3 py-2 bg-white/10 rounded-2xl rounded-tl-none border border-white/5 text-sm text-slate-200 shadow-sm leading-relaxed backdrop-blur-sm">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-xl">
                            <div className="relative flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Say something..."
                                        className="pr-10 bg-black/20 border-white/10 focus:bg-black/40 transition-colors"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-white text-slate-400 transition-colors"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </button>
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim()}
                                    className="rounded-full bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
                                >
                                    <Send className="h-4 w-4 ml-0.5" />
                                </Button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'users' && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 custom-scrollbar">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Active Participants</div>
                        {activeUsers.map((user) => (
                            <div key={user.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                                        <span className="text-xs font-bold text-white">{(user.name?.[0] || 'G').toUpperCase()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-100">{user.name}</span>
                                            {user.id === hostId && (
                                                <Crown className="h-3 w-3 text-yellow-400 fill-yellow-400/20" />
                                            )}
                                            {user.name === userName && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/20">You</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">Online</span>
                                    </div>
                                </div>

                                {isHost && user.id !== hostId && (
                                    <button
                                        onClick={() => onTransferHost(user.id)}
                                        title="Transfer Host"
                                        className="p-2 text-slate-500 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-all"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
