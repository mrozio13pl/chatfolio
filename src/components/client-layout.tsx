'use client';

import React from 'react';
import { Toaster } from 'sonner';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            {children}
            <Toaster />
        </main>
    );
}
