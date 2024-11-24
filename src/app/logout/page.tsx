'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Section } from '~/components/section';
import { api } from '~/lib/api';

export default function LogOutPage() {
    useEffect(() => {
        const logoutUser = async () => {
            await api('auth/logout');
            redirect('/');
        };

        logoutUser();
    }, []);

    return <Section>Logging out...</Section>;
}
