import { NextResponse } from 'next/server';
import { googleProvider } from '~/auth/providers/google';
import { generateState, generateCodeVerifier } from 'arctic';
import { cookies } from 'next/headers';

async function handler() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const authUrl = await googleProvider.createAuthorizationURL(
        state,
        codeVerifier,
        ['openid', 'email', 'profile'],
    );

    // add missing cookies to the request so that google auth works using next's cookies
    const cookie = await cookies();
    cookie.set('state', state);
    cookie.set('codeVerifier', codeVerifier);

    // Redirect to Google for authorization
    return NextResponse.json({ url: authUrl.toString() });
}

export { handler as GET, handler as POST };
