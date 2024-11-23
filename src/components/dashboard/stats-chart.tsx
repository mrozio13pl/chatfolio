'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
} from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '~/components/ui/chart';
import { isSameDay } from '~/lib/utils';
import type { MessageCounter } from '~/types';

const chartConfig = {
    messages: {
        label: 'Messages',
        color: 'var(--primary)',
    },
} satisfies ChartConfig;

function getLast30Days() {
    const dates = [];
    const today = new Date();

    for (let i = 30; i > 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i + 1);
        dates.push(date);
    }

    return dates;
}

function formatDate(date: Date) {
    const userLocale = navigator.language || 'en-US';
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    } satisfies Intl.DateTimeFormatOptions;

    return new Intl.DateTimeFormat(userLocale, options).format(date);
}

export function StatsChart({
    messages,
    showGrid = true,
    showLabels = true,
    showTooltip = true,
}: {
    messages: MessageCounter[];
    showGrid?: boolean;
    showLabels?: boolean;
    showTooltip?: boolean;
}) {
    const data = getLast30Days().map((date) => ({
        date: formatDate(date),
        messages:
            messages?.find(({ date: date2 }) =>
                isSameDay(date, new Date(date2)),
            )?.count || 0, // ~~(Math.random() * 200),
    }));

    return (
        <ChartContainer config={chartConfig}>
            <ResponsiveContainer aspect={3}>
                <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    {showGrid && <CartesianGrid vertical={false} />}
                    {showLabels && (
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.split(',')[0]}
                        />
                    )}
                    {showTooltip && (
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent className="bg-base-200" />
                            }
                        />
                    )}

                    <Bar dataKey="messages" fill="var(--primary)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
