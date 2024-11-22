'use client';

import React, { useRef, useState } from 'react';
import { useDashboard } from '~/hooks/dashboard';
import { useSession } from '~/providers/session';
import { api } from '~/lib/api';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Markdown } from '../markdown';
import clsx from 'clsx';
import Image from 'next/image';
import type { Message } from '~/types';

function ChatContainer({ ...props }: React.HTMLProps<HTMLDivElement>) {
    return <div className="fixed bottom-2 right-2" {...props} />;
}

function MessageComponent({ message }: { message: Message }) {
    const { user } = useSession();

    if (!user) return null;

    return (
        <div
            className={clsx(
                'flex w-full',
                message.role === 'user' && 'justify-end',
            )}
        >
            <div
                className={clsx(
                    'flex w-full',
                    message.role === 'user'
                        ? 'items-end flex-col p-2'
                        : 'gap-2',
                )}
            >
                {message.role === 'user' ? (
                    <p className="mx-2 mb-1 break-words overflow-hidden text-content-100">
                        You
                    </p>
                ) : (
                    <Image
                        src={user.image}
                        alt="demo"
                        width={32}
                        height={32}
                        className="rounded-full w-min h-min"
                    />
                )}
                <div
                    className={clsx(
                        message.role === 'user'
                            ? 'max-w-[60%] bg-base-200 rounded-2xl'
                            : 'max-w-full',
                    )}
                >
                    <div
                        className={clsx(
                            'break-words max-w-full',
                            message.role === 'user'
                                ? 'text-content-200 p-4'
                                : 'pr-8',
                        )}
                    >
                        <Markdown content={message.content} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Chat() {
    const { dashboard } = useDashboard();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isDisabled =
        isTyping || isLoading || !inputRef.current?.value.trim().length;

    async function submit() {
        if (!input.trim().length) return;

        setIsLoading(true);
        setIsTyping(true);

        try {
            setMessages((prev) => [
                ...prev,
                { role: 'user', content: input },
                { role: 'assistant', content: '' },
            ]);

            const { body } = await api.post('v1/messages', {
                json: {
                    messages,
                    message: input,
                    clientId: dashboard?.clientId || 'demo',
                    stream: true,
                },
            });

            const reader = body!.getReader();
            const decoder = new TextDecoder('utf-8');
            let contentBuffer = '';

            inputRef.current!.value = '';
            setInput('');
            setIsLoading(false);

            while (true) {
                const { value, done } = await reader.read();

                if (value) {
                    const chunk = decoder.decode(value);
                    contentBuffer += chunk;

                    setMessages((prev) => {
                        const updatedMessages = [...prev];
                        updatedMessages[messages.length + 1].content =
                            contentBuffer;
                        return updatedMessages;
                    });
                }

                if (done) break;
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    }

    return (
        <ChatContainer>
            <div className="min-h-[60vh] h-[500px] w-96 rounded-lg flex flex-col-reverse border border-base-300">
                <div className="flex p-4">
                    <Input
                        placeholder="Ask me anything..."
                        ref={inputRef}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                        }}
                    />
                    <Button
                        variant="ghost"
                        className="absolute right-2 disabled:cursor-not-allowed disabled:pointer-events-none"
                        disabled={isDisabled}
                        onClick={submit}
                        title={
                            isLoading
                                ? 'Thinking...'
                                : isDisabled
                                  ? 'Your message is empty'
                                  : 'Send'
                        }
                    >
                        <Send className="!size-6" />
                    </Button>
                </div>
                <div
                    className="flex flex-col size-full p-4 overflow-y-auto overflow-x-hidden"
                    ref={containerRef}
                >
                    {messages
                        .filter((message) => message.content)
                        .map((message, index) => (
                            <MessageComponent key={index} message={message} />
                        ))}

                    {isLoading && (
                        <div className="flex w-full items-center pl-12 pt-4 gap-2">
                            <p className="text-content-200">Thinking...</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="border-b border-b-base-300 py-2 px-4 mt-1">
                    <h2 className="text-content-200 font-primary font-bold text-2xl">
                        Chat with me
                    </h2>
                    <p className="text-content-300 text-sm">
                        Demo chat for testing.
                    </p>
                </div>
            </div>
        </ChatContainer>
    );
}
