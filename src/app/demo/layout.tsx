import React from 'react';
import { Navbar } from '~/components/navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chatfolio | Demo',
    description: 'Chatfolio: An example chatbot.',
};

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
