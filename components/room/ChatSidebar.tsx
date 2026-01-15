import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send, Smile } from 'lucide-react';

export function ChatSidebar() {
    const messages = [
        { id: 1, user: 'Ryan', text: 'This intro is fire! 🔥', color: 'bg-blue-500' },
        { id: 2, user: 'Sarah', text: 'Wait, did you see that easter egg?', color: 'bg-pink-500' },
        { id: 3, user: 'Alex', text: 'Volume up pls', color: 'bg-green-500' },
    ];

    return (
        <div className="flex h-full flex-col glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
                <h3 className="font-semibold text-slate-200">Live Chat</h3>
                <span className="text-xs text-slate-500">3 users online</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className={`h-8 w-8 shrink-0 rounded-full ${msg.color} ring-2 ring-brand-dark`} />
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 mb-1 ml-1">{msg.user}</span>
                            <div className="px-3 py-2 bg-white/10 rounded-2xl rounded-tl-none border border-white/5 text-sm text-slate-200 shadow-sm leading-relaxed">
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-white/5">
                <div className="relative">
                    <Input placeholder="Say something..." className="pr-10" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-white text-slate-400 transition-colors">
                        <Smile className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
