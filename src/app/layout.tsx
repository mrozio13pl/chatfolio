import type { Metadata } from 'next';
import { ClientLayout } from '~/components/client-layout';
import { getSession } from '~/auth/get-session';
import {
    SessionProvider,
    type SessionProviderProps,
} from '~/providers/session';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/roboto-slab';
import './globals.css';

export const metadata: Metadata = {
    title: 'Chatfolio - Your personalized chatbot about you',
    description:
        'Chatfolio: Your personalized chatbot about you for your portfolio website',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const sessionData = (await getSession()) as SessionProviderProps;

    return (
        <html lang="en">
            <body className="antialiased bg-base-100 text-content-100">
                <SessionProvider value={sessionData}>
                    <ClientLayout>{children}</ClientLayout>
                </SessionProvider>
            </body>
        </html>
    );
}
