'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { auth } from '.';
import { connectMongoose } from '~/lib/mongoose';
import type { AuthStatus } from '~/types';

export const getSession = cache(async () => {
    await connectMongoose();

    const sessionId = (await cookies()).get(auth.sessionCookieName)?.value;

    if (!sessionId)
        return {
            user: null,
            session: null,
            name: null,
            status: 'unauthorized' satisfies AuthStatus,
        };

    const sessionData = await auth.validateSession(sessionId);

    return { status: 'authorized' satisfies AuthStatus, ...sessionData };
});
