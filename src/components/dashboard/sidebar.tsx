'use client';

import { Button } from '../ui/button';
import { redirect, usePathname } from 'next/navigation';
import { withoutLeadingSlash } from 'ufo';
import { clsx } from 'clsx';
import Link from 'next/link';

const paths: string[] = [
    'information',
    'model',
    'mistral-key',
    'stats',
    'docs',
];

export function Sidebar() {
    const pathname = usePathname() ?? '/';
    const path = withoutLeadingSlash(pathname).split('/').at(-1);

    if (path === 'dashboard') {
        redirect('/dashboard/information');
    }

    return (
        <div className="fixed space-y-2 flex flex-col">
            {paths.map((p) => (
                <Button
                    key={p}
                    variant="ghost"
                    className={clsx(
                        'justify-end capitalize',
                        path === p && 'text-primary',
                    )}
                >
                    <Link href={'/dashboard/' + p}>
                        {p.split('-').join(' ')}
                    </Link>
                </Button>
            ))}
        </div>
    );
}
