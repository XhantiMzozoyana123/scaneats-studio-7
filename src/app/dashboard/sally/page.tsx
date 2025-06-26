'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'sally';
  content: string;
};

export default function SallyPage() {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');

  const getInitialMessage = () => {
    if (intent === 'meal-plan') {
      return "I've analyzed your meal history. What would you like to know?";
    }
    return "I'm your personal assistant, Sally. You can ask me anything about your health and nutrition.";
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'sally', content: getInitialMessage() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        'div[data-radix-scroll-area-viewport]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call with a canned response for UI design
    setTimeout(() => {
      const sallyResponse: Message = {
        role: 'sally',
        content: `This is a mock response to: "${userMessage.content}". API calls are disabled for design purposes.`,
      };
      setMessages((prev) => [...prev, sallyResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(135deg,#f0e8f8_0%,#e8eaf6_50%,#f0f4f8_100%)]">
      <Link
        href="/dashboard"
        aria-label="Close"
        className="absolute top-6 left-6 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-gray-800 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white/40 hover:text-black"
      >
        <X size={18} />
      </Link>

      <div className="flex h-[90vh] w-full max-w-md flex-col rounded-3xl border border-white/40 bg-white/70 p-4 shadow-[0_20px_55px_8px_rgba(110,100,150,0.45)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="flex-shrink-0 p-2 text-center text-lg font-bold text-gray-800">
          Sally
        </div>
        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'sally' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-gray-800 shadow-sm'
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-white text-gray-800 shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex-shrink-0 p-2">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sally anything..."
              className="rounded-full pr-12 text-black"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
              disabled={isLoading}
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
