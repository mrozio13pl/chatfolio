import { DashboardLayout } from '~/components/dashboard/dashboard-layout';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chatfolio - Dashboard',
    description: 'Chatfolio: Dashboard page',
};

export default function DashboardPageLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
