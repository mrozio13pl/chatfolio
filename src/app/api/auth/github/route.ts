import { NextResponse } from 'next/server';
import { githubProvider } from '~/auth/providers/github';
import { generateState } from 'arctic';
import { cookies } from 'next/headers';

async function handler() {
    const state = generateState();
    const authUrl = await githubProvider.createAuthorizationURL(state, [
        'user:email',
    ]);

    const cookie = await cookies();
    cookie.set('github_oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax',
    });

    return NextResponse.json({ url: authUrl.toString() });
}

export { handler as GET, handler as POST };
