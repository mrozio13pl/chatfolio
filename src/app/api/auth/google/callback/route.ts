import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { URL } from 'node:url';
import qs from 'node:querystring';
import ky from 'ky';
import { joinURL } from 'ufo';
import { auth } from '~/auth';
import { User, UserModel } from '~/models/user';
import { connectMongoose } from '~/lib/mongoose';
import { googleProvider } from '~/auth/providers/google';

interface GoogleUser {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const { searchParams } = url;

    const cookie = await cookies();
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const loginUrl = joinURL(process.env.SITE_URL!, '/login');
    const dashboardUrl = joinURL(process.env.SITE_URL!, '/dashboard');

    if (!code || !state) {
        return NextResponse.redirect(loginUrl);
    }

    const codeVerifier = cookie.get('codeVerifier')?.value;
    const savedState = cookie.get('state')?.value;

    if (!codeVerifier || !savedState) {
        return NextResponse.redirect(
            loginUrl +
                '?' +
                qs.stringify({
                    e: 'Please login from the login page.',
                }),
        );
    }

    if (state !== savedState) {
        return NextResponse.redirect(
            loginUrl +
                '?' +
                qs.stringify({
                    e: "Given states don't match! Please try again.",
                }),
        );
    }

    try {
        const authCode = await googleProvider.validateAuthorizationCode(
            code,
            codeVerifier,
        );

        const googleData = await ky
            .get('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: { Authorization: `Bearer ${authCode.accessToken()}` },
            })
            .json<GoogleUser>();

        await connectMongoose();

        const user =
            (await UserModel.findOne({ email: googleData.email })) ||
            new UserModel({
                id: googleData.id,
                email: googleData.email,
                name: googleData.name,
                picture: googleData.picture,
            } as User);

        await user.save();

        const session = await auth.createSession(user._id, {});
        const sessionCookie = auth.createSessionCookie(session.id);

        cookie.set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );

        return NextResponse.redirect(dashboardUrl);
    } catch (error) {
        console.error(error);

        return NextResponse.redirect(
            loginUrl +
                '?' +
                qs.stringify({
                    error: 'Something went wrong! Please try again.',
                }),
        );
    }
}
