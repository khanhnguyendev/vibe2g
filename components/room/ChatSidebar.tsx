'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send, Smile } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type Message = {
    id: number;
    user: string;
    text: string;
    color: string;
    timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
    { id: 1, user: 'Ryan', text: 'This intro is fire! 🔥', color: 'bg-blue-500', timestamp: new Date() },
    { id: 2, user: 'Sarah', text: 'Wait, did you see that easter egg?', color: 'bg-pink-500', timestamp: new Date() },
    { id: 3, user: 'Alex', text: 'Volume up pls', color: 'bg-green-500', timestamp: new Date() },
];

export function ChatSidebar() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            user: 'You',
            text: inputValue,
            color: 'bg-violet-500',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
    };

    return (
        <div className="flex h-full flex-col glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-xl flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-200">Live Chat</h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        3 users online
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 min-h-0">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className={cn("h-8 w-8 shrink-0 rounded-full ring-2 ring-brand-dark flex items-center justify-center text-xs font-bold text-white shadow-lg", msg.color)}>
                            {msg.user[0]}
                        </div>
                        <div className="flex flex-col max-w-[85%]">
                            <span className="text-xs text-slate-400 mb-1 ml-1 flex items-center gap-2">
                                {msg.user}
                                <span className="text-[10px] opacity-50">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </span>
                            <div className="px-3 py-2 bg-white/10 rounded-2xl rounded-tl-none border border-white/5 text-sm text-slate-200 shadow-sm leading-relaxed backdrop-blur-sm">
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
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
        </div>
    );
}
