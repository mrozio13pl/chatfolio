'use client';

import clsx from 'clsx';
import { StatsChart } from '~/components/dashboard/stats-chart';
import { Section } from '~/components/section';
import { useDashboard } from '~/hooks/dashboard';
import { useSession } from '~/providers/session';

export default function Stats() {
    const { status } = useSession();
    const { dashboard } = useDashboard();

    if (status === 'unauthorized' || !dashboard) {
        return (
            <Section>
                <h2 className="text-2xl">Loading...</h2>
            </Section>
        );
    }

    return (
        <Section className="min-h-min min-w-full">
            <div className="w-full">
                <div className="m-2">
                    <h2 className="text-2xl font-primary font-bold">Stats</h2>
                    <p className="text-content-300">
                        You have{' '}
                        {dashboard.messagesCounter
                            .map(({ count }) => count)
                            .reduce((a, b) => a + b, 0)}{' '}
                        messages in last month.
                    </p>
                </div>
                <StatsChart messages={dashboard.messagesCounter} />
            </div>
            <div className="w-full m-2 mb-8">
                <h2 className="text-2xl font-primary font-bold">Messages</h2>
                <p className="text-content-300 mb-2">Chats from last week.</p>
                <div className="flex flex-col gap-2">
                    {dashboard.chats?.toReversed().map((chat, chatIndex) => (
                        <div
                            key={chatIndex}
                            className="border-base-200 border rounded-lg p-4"
                        >
                            <p className="text-content-300 text-sm text-right mb-2">
                                {new Date(chat.date).toISOString()}
                            </p>
                            <div className="space-y-2">
                                {chat.messages.map((message, messageIndex) => (
                                    <div
                                        key={messageIndex}
                                        className={clsx(
                                            'flex',
                                            message.role === 'user' &&
                                                'justify-end',
                                        )}
                                    >
                                        <p
                                            className={clsx(
                                                message.role === 'user' &&
                                                    'text-right bg-base-200 max-w-[60%] rounded-md py-1 px-2',
                                            )}
                                        >
                                            {message.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
