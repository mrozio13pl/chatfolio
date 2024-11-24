import { NextResponse } from 'next/server';
import { logout } from '~/auth/logout';

export async function GET() {
    await logout();

    return NextResponse.json({ success: true });
}
