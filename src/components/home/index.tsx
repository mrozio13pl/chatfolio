'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section } from '../section';
import { Button } from '../ui/button';
import { Navbar } from '../navbar';

export function Home() {
    return (
        <main>
            <Navbar />
            <Section className="gap-4 flex-row">
                <div className="space-y-2">
                    <h1 className="text-9xl font-extrabold font-primary -ml-8">
                        chat about{' '}
                        <span className="inline-flex text-primary">me</span>
                    </h1>
                    <p className="text-2xl font-extralight">
                        Your very own chatbot, designed for portfolio websites,{' '}
                        <span className="underline underline-primary underline-offset-4 decoration-primary">
                            for free
                        </span>
                    </p>
                    <div className="flex gap-2 pt-4">
                        <Link href="/docs">
                            <Button variant="secondary">Documentation</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost">
                                Get Started <ArrowRight />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Section>
        </main>
    );
}
