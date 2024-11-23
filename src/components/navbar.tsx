'use client';

import { useSession } from '~/providers/session';
import { Button } from './ui/button';
import { Logo } from './logo';
import Link from 'next/link';

export function Navbar() {
    const { status } = useSession();

    return (
        <div className="fixed top-0 w-screen flex items-center [&_div]:flex-1 px-20 z-50">
            <div>
                <Button variant="ghost" className="hover:opacity-75">
                    <Logo />
                </Button>
            </div>
            <div className="rounded-b-2xl flex items-center justify-center gap-2 backdrop-blur-md py-4">
                <Link href="/">
                    <Button variant="ghost" className="!rounded-full">
                        Home
                    </Button>
                </Link>
                <Link href="/docs">
                    <Button variant="ghost">Docs</Button>
                </Link>
                <Link href="/demo">
                    <Button
                        variant="ghost"
                        className="text-primary underline underline-offset-2"
                    >
                        Demo
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-end gap-2">
                {status === 'unauthorized' ? (
                    <Link prefetch={false} href="/login">
                        <Button variant="outline" className="rounded-full">
                            Log in
                        </Button>
                    </Link>
                ) : (
                    <>
                        <Link href="/dashboard">
                            <Button className="bg-secondary">Dashboard</Button>
                        </Link>
                        <Link prefetch={false} href="/logout">
                            <Button variant="outline" className="rounded-full">
                                Log out
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
