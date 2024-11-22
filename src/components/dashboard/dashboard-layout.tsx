'use client';

import { redirect } from 'next/navigation';
import { useSession } from '~/providers/session';
import { Sidebar } from '~/components/dashboard/sidebar';
import { Navbar } from '~/components/navbar';
import { Separator } from '~/components/ui/separator';
import { Section } from '~/components/section';
import { Chat } from '~/components/dashboard/chat';
import { useDashboard } from '~/hooks/dashboard';
import { api } from '~/lib/api';
import type { Dashboard } from '~/types';
import type { ReactNode } from 'react';

export function DashboardLayout({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const { dashboard, setDashboard } = useDashboard();

    async function fetchDashboard() {
        try {
            const dashboardData = await api(
                'chatfolio/profile',
            ).json<Dashboard>();
            setDashboard(dashboardData);
        } catch (error) {
            console.error(error);
        }
    }

    // TODO: fix
    // if (status === 'unauthorized') {
    //     redirect('/logout');
    // }

    if (!dashboard) {
        fetchDashboard();
        return <Section>Loading...</Section>;
    }

    return (
        <div className="w-full flex justify-center">
            <Chat />
            <Navbar />
            <div className="flex w-1/2 mt-20 gap-8 justify-center">
                <div className="w-0 flex justify-end">
                    <Sidebar />
                    <Separator orientation="vertical" className="fixed h-4/5" />
                </div>
                <div className="w-2/3">{children}</div>
            </div>
        </div>
    );
}
