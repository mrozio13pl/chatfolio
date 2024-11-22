'use client';

import React, { useState } from 'react';
import Form from 'next/form';
import Link from 'next/link';
import { Section } from '~/components/section';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Loader } from '~/components/loader';
import { toast } from 'sonner';
import { saveMistralKey } from '~/actions/mistral-key';

export default function MistralKeyPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [input, setInput] = useState('');

    async function save(data: FormData) {
        setIsSaving(true);

        try {
            const { success, error } = await saveMistralKey(
                data.get('key')!.toString(),
            );

            if (success) {
                toast.success('Successfully saved!');
            } else {
                toast.error(error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong!');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Section className="min-h-min min-w-full">
            <Form
                action={save}
                className="flex flex-col items-center justify-start w-full"
            >
                <div className="space-y-2 w-full m-4 !ml-8">
                    <h2 className="text-2xl font-semibold font-primary">
                        Mistral API key
                    </h2>
                    <p className="text-content-300">
                        Use your own Mistral API key to avoid rate limiting. You
                        will not be asked for this key again and won&apos;t be
                        able to access it on your dashboard for security
                        reasons. Learn more{' '}
                        <Link
                            className="text-secondary hover:underline"
                            href="/docs/mistral-key"
                        >
                            here
                        </Link>
                        .
                    </p>
                    <p className="text-content-300">
                        Obtain your API key{' '}
                        <Link
                            className="text-secondary hover:underline"
                            target="_blank"
                            href="https://console.mistral.ai/api-keys/"
                        >
                            here
                        </Link>
                        .
                    </p>
                    <Input
                        type="password"
                        name="key"
                        placeholder="Paste Mistral API key"
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    variant="secondary"
                    className="rounded-[4px] w-20 mb-4"
                    disabled={isSaving}
                >
                    {input.length > 0 ? 'Save' : 'Reset'}{' '}
                    {isSaving && <Loader />}
                </Button>
            </Form>
        </Section>
    );
}
