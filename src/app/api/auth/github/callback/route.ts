import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { URL } from 'node:url';
import qs from 'node:querystring';
import ky from 'ky';
import { joinURL } from 'ufo';
import { auth } from '~/auth';
import { User, UserModel } from '~/models/user';
import { connectMongoose } from '~/lib/mongoose';
import { githubProvider } from '~/auth/providers/github';

interface GitHubUser {
    id: number;
    login: string;
    avatar_url: string;
    name: string | null;
    email: string | null;
}

interface GithubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: 'private' | null;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const { searchParams } = url;

    const cookie = await cookies();
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const loginUrl = joinURL(process.env.SITE_URL!, '/login');
    const dashboardUrl = joinURL(process.env.SITE_URL!, '/dashboard');
    const storedState = cookie.get('github_oauth_state')?.value ?? null;

    if (!code || !state || !storedState) {
        return NextResponse.redirect(
            loginUrl +
                '?' +
                qs.stringify({
                    error: 'Please login from the login page.',
                }),
        );
    }

    if (state !== storedState) {
        return NextResponse.redirect(
            loginUrl +
                '?' +
                qs.stringify({
                    error: "Given states don't match! Please try again.",
                }),
        );
    }

    try {
        const tokens = await githubProvider.validateAuthorizationCode(code);
        const githubAccessToken = tokens.accessToken();

        const githubData = await ky
            .get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${githubAccessToken}` },
            })
            .json<GitHubUser>();

        const emails = await ky
            .get('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${githubAccessToken}` },
            })
            .json<GithubEmail[]>();

        const { email } = emails.find(
            (email) => email.email && email.verified && email.primary,
        ) || { email: null };

        if (!email) {
            return NextResponse.redirect(
                loginUrl +
                    '?' +
                    qs.stringify({
                        error: 'You must have a verified email on your GitHub account.',
                    }),
            );
        }

        await connectMongoose();

        const user =
            (await UserModel.findOne({ email })) ||
            new UserModel({
                id: githubData.id,
                email,
                name: githubData.name || githubData.login,
                picture: githubData.avatar_url,
            } as unknown as User);

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
