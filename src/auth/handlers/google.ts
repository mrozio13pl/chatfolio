'use client';

import ky from 'ky';

export async function handleGoogleLogin() {
    const { url: authUrl } = await ky('/api/auth/google').json<{
        url: string;
    }>();

    window.location.href = authUrl;
}
