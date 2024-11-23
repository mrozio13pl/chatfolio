'use client';

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
        </Section>
    );
}
