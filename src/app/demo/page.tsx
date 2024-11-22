'use client';

import Image from 'next/image';
import { Section } from '~/components/section';
import { DemoChat } from '~/components/demo/demo-chat';

export default function DemoPage() {
    return (
        <Section className="justify-start">
            <div className="w-1/2 space-y-12 mt-28">
                <div className="flex items-center justify-center gap-8 ml-12">
                    <Image
                        src="/demo.jpg"
                        alt="demo"
                        className="rounded-full"
                        width={200}
                        height={200}
                    />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-6xl font-extrabold">
                            Non-existent user
                        </h1>
                        <p className="text-content-300 w-2/3 text-balance">
                            I am passionate programmer. I love to code. I am a
                            developer. But I don&apos;t actually exists. Feel
                            free to chat with me!
                        </p>
                    </div>
                </div>

                <DemoChat />
            </div>
        </Section>
    );
}
