'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import TextareaAutosize from 'react-textarea-autosize';
import clsx from 'clsx';
import { Send } from 'lucide-react';
import { api } from '~/lib/api';
import { Markdown } from '~/components/markdown';
import { Button } from '~/components/ui/button';
import type { Message } from '~/types';

function Avatar() {
    return (
        <Image
            src="/demo.jpg"
            alt="demo"
            width={32}
            height={32}
            className="rounded-full w-min h-min"
        />
    );
}

function MessageComponent({ message }: { message: Message }) {
    return (
        <div
            className={clsx(
                'flex w-full px-8 py-2',
                message.role === 'user' && 'justify-end',
            )}
        >
            <div
                className={clsx(
                    'flex w-full p-4',
                    message.role === 'user' ? 'items-end flex-col' : 'gap-2',
                )}
            >
                {message.role === 'user' ? (
                    <p className="mx-2 mb-1 break-words overflow-hidden text-content-100">
                        You
                    </p>
                ) : (
                    <Avatar />
                )}
                <div
                    className={clsx(
                        message.role === 'user'
                            ? 'max-w-[60%] bg-base-200 rounded-2xl'
                            : 'w-full',
                    )}
                >
                    <div
                        className={clsx(
                            'break-words max-w-full',
                            message.role === 'user' && 'text-content-200 p-4',
                        )}
                    >
                        <Markdown content={message.content} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DemoChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isDisabled =
        isTyping || isLoading || !inputRef.current?.value.trim().length;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const isNearBottom = () => {
        if (!containerRef.current) return false;

        return (
            containerRef.current.clientHeight - window.scrollY <=
            window.innerHeight
        );
    };

    useEffect(() => {
        if (isNearBottom()) {
            scrollToBottom();
        }
    }, [messages, isLoading]);

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
                    clientId: 'demo',
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
        <div className="relative">
            <div className="flex flex-col w-full mb-20" ref={containerRef}>
                {messages
                    .filter((message) => message.content)
                    .map((message, index) => (
                        <MessageComponent key={index} message={message} />
                    ))}

                {isLoading && (
                    <div className="flex w-full items-center pl-12 pt-4 gap-2">
                        <Avatar />
                        <p className="text-content-200">Thinking...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 bg-base-100">
                <div className="flex items-center relative w-1/2 mb-4">
                    <TextareaAutosize
                        className="rounded-[32px] bg-base-300 w-full py-4 pl-12 pr-16 text-content-100 text-lg outline-none resize-none"
                        placeholder="Type your message here..."
                        maxRows={5}
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
                        className="absolute right-6 disabled:cursor-not-allowed disabled:pointer-events-none"
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
            </div>
        </div>
    );
}
