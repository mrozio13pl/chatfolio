'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        router.push('/docs');
    }, [router]);

    return <p className="mt-2">Redirecting...</p>;
}
