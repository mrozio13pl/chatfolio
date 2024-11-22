import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import 'github-markdown-css/github-markdown-dark.css';

const CLIENT_ID = 'demo'; // Replace with your Client ID.

interface TMessage {
    role: 'user' | 'assistant';
    content: string;
}

/* Component for displaying Markdown */
function Markdown({ content }: { content: string }) {
    const markdownHtml = marked(content, { async: false });

    return (
        <span
            className="markdown-body"
            dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(markdownHtml),
            }}
        />
    );
}

function Message({ message }: { message: TMessage }) {
    return (
        <div
            className={clsx(
                'flex w-full',
                message.role === 'user' ? 'justify-end' : 'gap-2',
            )}
        >
            <div
                className={clsx(
                    'break-words',
                    message.role === 'assistant'
                        ? 'w-full'
                        : 'max-w-[60%] bg-gray-500/50 rounded-lg p-4',
                )}
            >
                <Markdown content={message.content} />
            </div>
        </div>
    );
}

export function Chat() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isDisabled =
        isLoading || isBotTyping || !inputRef.current?.value.trim().length;

    async function submit() {
        if (!input.trim().length) return;

        setIsLoading(true);
        setIsBotTyping(true);

        try {
            setMessages((prev) => [
                ...prev,
                { role: 'user', content: input },
                { role: 'assistant', content: '' },
            ]);

            const { body } = await fetch(
                'http://localhost:3000/api/v1/messages',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages,
                        message: input,
                        clientId: CLIENT_ID,
                        stream: true,
                    }),
                },
            );

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
            setIsBotTyping(false);
        }
    }

    return (
        <div className="fixed bottom-2 right-2 z-50">
            <div
                className={clsx(
                    'w-96 rounded-lg flex flex-col border border-gray-700 bg-gray-800 [&>div]:p-4',
                    isCollapsed ? 'h-min' : 'h-[500px]',
                )}
                style={{ width: '400px' }}
            >
                <div
                    className={clsx(
                        'py-2 px-4 mt-1 flex justify-between items-center w-full cursor-pointer',
                        !isCollapsed && 'border-b border-gray-700',
                    )}
                    onClick={() => setIsCollapsed((prev) => !prev)}
                >
                    <div className="space-y-2">
                        <h2 className="text-white font-bold text-2xl">
                            Chat with me
                        </h2>
                        <p className="text-gray-300 text-sm">
                            Demo chat for testing.
                        </p>
                    </div>
                    <div>{isCollapsed ? <ChevronUp /> : <ChevronDown />}</div>
                </div>
                <div
                    className={clsx(
                        'flex flex-col w-full h-full p-4 overflow-y-auto gap-2',
                        isCollapsed && 'hidden',
                    )}
                    ref={containerRef}
                >
                    {messages
                        .filter((message) => message.content)
                        .map((message, index) => (
                            <Message key={index} message={message} />
                        ))}

                    {isLoading && <p className="text-white">Thinking...</p>}
                    <div ref={messagesEndRef} />
                </div>
                <div
                    className={clsx(
                        'flex items-center relative w-full',
                        isCollapsed && 'hidden',
                    )}
                >
                    <input
                        type="text"
                        className="flex h-10 w-full rounded-xl p-4 text-base bg-transparent outline-none"
                        placeholder="Ask me anything!"
                        ref={inputRef}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                        }}
                    />
                    <button
                        className="bg-transparent border-none absolute right-4 disabled:opacity-50"
                        disabled={isDisabled}
                        onClick={() => submit()}
                    >
                        <Send />
                    </button>
                </div>
            </div>
        </div>
    );
}
