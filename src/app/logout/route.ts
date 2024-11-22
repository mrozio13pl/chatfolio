'use server';

import { logout } from '~/auth/logout';
import { revalidatePath } from 'next/cache';
import { RedirectType, redirect } from 'next/navigation';

export async function GET() {
    await logout();

    revalidatePath('/');
    redirect('/', RedirectType.push);
}
