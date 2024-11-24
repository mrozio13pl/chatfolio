import { NextResponse } from 'next/server';
import { joinURL } from 'ufo';
import { validateRequest } from '~/auth/validate-request';
import { UserModel, type User } from '~/models/user';
import type { Dashboard } from '~/types';

export async function GET() {
    const { user, session } = await validateRequest();

    if (!session) {
        return NextResponse.redirect(joinURL(process.env.SITE_URL!, '/login'));
    }

    const userModel: User | null = await UserModel.findById(user.id);

    if (!userModel) {
        return NextResponse.redirect(joinURL(process.env.SITE_URL!, '/logout'));
    }

    return NextResponse.json({
        clientId: userModel.clientId,
        model: userModel.model,
        portfolio: userModel.portfolio,
        messagesCounter: userModel.messagesCounter,
        chats: userModel.chats,
    } satisfies Dashboard);
}
