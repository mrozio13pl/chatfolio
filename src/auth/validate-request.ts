'use server';

import type { Session, User } from 'lucia';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { auth } from '.';

export const validateRequest = cache(
    async (): Promise<
        { user: User; session: Session } | { user: null; session: null }
    > => {
        const cookie = await cookies();
        const sessionId = cookie.get(auth.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return {
                user: null,
                session: null,
            };
        }

        const result = await auth.validateSession(sessionId);
        // next.js throws when you attempt to set cookie when rendering page
        try {
            if (result.session && result.session.fresh) {
                const sessionCookie = auth.createSessionCookie(
                    result.session.id,
                );
                cookie.set(
                    sessionCookie.name,
                    sessionCookie.value,
                    sessionCookie.attributes,
                );
            }
            if (!result.session) {
                const sessionCookie = auth.createBlankSessionCookie();
                cookie.set(
                    sessionCookie.name,
                    sessionCookie.value,
                    sessionCookie.attributes,
                );
            }
        } catch (e) {
            console.error(e);
        }

        return result;
    },
);
