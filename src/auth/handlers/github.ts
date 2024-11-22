'use client';

import ky from 'ky';

export async function handleGithubLogin() {
    const { url: authUrl } = await ky('/api/auth/github').json<{
        url: string;
    }>();

    window.location.href = authUrl;
}
