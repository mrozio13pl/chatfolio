'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '.';

export async function logout(redirectUrl = '/') {
    const sessionCookie = auth.createBlankSessionCookie();
    (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );

    redirect(redirectUrl);
}
