'use client';

import Image from 'next/image';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { handleGithubLogin } from '~/auth/handlers/github';
import { handleGoogleLogin } from '~/auth/handlers/google';
import { AuthButton } from '~/components/login/auth-button';
import { Section } from '~/components/section';
import { useSession } from '~/providers/session';

export default function LoginPage() {
    const { status } = useSession();
    const searchParams = useSearchParams();
    const error = searchParams?.get('error');

    useEffect(() => {
        if (error) {
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [error]);

    if (status === 'authorized') {
        redirect('/dashboard');
    }

    return (
        <Section>
            <div className="w-1/3 flex items-center flex-col gap-4">
                <AuthButton
                    onClick={handleGoogleLogin}
                    icon={
                        <Image
                            src={'/icons/google.svg'}
                            alt="google"
                            width={32}
                            height={32}
                        />
                    }
                >
                    <h2>Sign in with Google</h2>
                </AuthButton>
                <AuthButton
                    className="bg-slate-600 hover:bg-slate-500 text-white"
                    onClick={handleGithubLogin}
                    icon={
                        <Image
                            src={'/icons/github.svg'}
                            alt="github"
                            width={32}
                            height={32}
                        />
                    }
                >
                    <h2>Sign in with Github</h2>
                </AuthButton>
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </Section>
    );
}
