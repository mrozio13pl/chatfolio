'use client';

import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Image from 'next/image';
import copy from 'copy-text-to-clipboard';
import clsx from 'clsx';
import { Check, Clipboard, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Section } from '~/components/section';
import { useSession } from '~/providers/session';
import { useDashboard } from '~/hooks/dashboard';
import { formToObject } from '~/lib/form-to-object';
import { savePortfolio } from '~/actions/portfolio';
import { toast } from 'sonner';
import { Loader } from '~/components/loader';
import { api } from '~/lib/api';
import { Dashboard } from '~/types';
import { Checkbox } from '~/components/ui/checkbox';

export default function InformationPage() {
    const { status, user } = useSession();
    const { dashboard, setDashboard } = useDashboard();
    const [isSaving, setIsSaving] = useState(false);
    const [socials, setSocials] = useState<string[]>([]);
    const [isCopying, setIsCopying] = useState(false);

    function copyToClipboard() {
        if (!dashboard) return;

        setIsCopying(true);
        copy(dashboard.clientId);

        setTimeout(() => {
            setIsCopying(false);
        }, 1500);
    }

    async function save(form: FormData) {
        setIsSaving(true);

        const data = formToObject(form, {
            boolean: ['strictOrigin'],
            string: ['about', 'website'],
        });
        const { success, error } = await savePortfolio(data);

        setIsSaving(false);

        const dashboardData = await api('chatfolio/profile').json<Dashboard>();
        setDashboard(dashboardData);

        if (success) {
            toast.success('Saved successfully!');
            return;
        }

        error.forEach((e) => toast.error(e));
    }

    useEffect(() => {
        if (!dashboard) return;

        setSocials(dashboard.portfolio.socials);
    }, [dashboard]);

    if (status === 'unauthorized' || !dashboard) {
        return (
            <Section>
                <h2 className="text-2xl">Loading...</h2>
            </Section>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                save(formData);
            }}
            className="flex flex-col items-center justify-start"
        >
            <div className="flex items-center gap-4 my-4">
                <h1 className="font-primary text-4xl font-extrabold">
                    Welcome, <span className="text-primary">{user.name}</span>
                </h1>
                <Image
                    src={user.image}
                    alt=""
                    width={100}
                    height={100}
                    className="rounded-full"
                />
            </div>
            <div className="m-2 space-y-2 w-full">
                <h2 className="text-2xl font-semibold ml-2 font-primary">
                    Client ID
                </h2>
                <div className="flex px-4 py-1 rounded-xl text-content-300 border border-base-300 items-center gap-2 w-max">
                    <p>{dashboard.clientId}</p>
                    <Button
                        type="button"
                        variant="ghost"
                        className={clsx(
                            'p-0.5',
                            isCopying && 'pointer-events-none cursor-default',
                        )}
                        onClick={copyToClipboard}
                    >
                        {isCopying ? <Check /> : <Clipboard />}
                    </Button>
                </div>
            </div>
            <section className="space-y-2 w-full m-4" id="website">
                <div className="ml-2">
                    <h2 className="text-2xl font-semibold font-primary">
                        Website
                    </h2>
                    <p className="text-content-300">
                        Your website will be used to verify requests to the
                        chatbot.
                    </p>
                </div>
                <Input
                    placeholder="Enter your website, e.g. https://example.com/"
                    defaultValue={dashboard.portfolio.website}
                    name="website"
                    maxLength={255}
                />
            </section>
            <section className="space-y-2 w-full m-4" id="strict-origin">
                <div className="ml-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-semibold font-primary">
                            Strict Origin
                        </h2>
                        <Checkbox
                            name="strictOrigin"
                            defaultChecked={dashboard.portfolio.strictOrigin}
                        />
                    </div>
                    <p className="text-content-300">
                        If enabled, the chatbot will only respond to requests
                        from your website.
                    </p>
                </div>
            </section>
            <section className="space-y-2 w-full m-4" id="socials">
                <h2 className="text-2xl font-semibold ml-2 font-primary">
                    Socials
                </h2>
                <div>
                    <Input
                        placeholder="Add social links"
                        className="mb-4"
                        maxLength={255}
                        onKeyDown={(e) => {
                            if (
                                e.key === 'Enter' &&
                                e.currentTarget.value.trim()
                            ) {
                                setSocials([...socials, e.currentTarget.value]);
                                e.currentTarget.value = '';
                                e.preventDefault();
                            }
                        }}
                    />
                    <p className="text-content-300 m-2 text-sm">
                        Press{' '}
                        <span className="p-1.5 bg-base-200 rounded-[4px]">
                            ENTER
                        </span>{' '}
                        to add social link.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {socials.map((s, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-1 rounded-xl text-content-300 border border-base-300"
                        >
                            <input
                                defaultValue={s}
                                name="socials"
                                className="[all:unset]"
                                placeholder="Link here..."
                                maxLength={255}
                            />
                            <Button
                                variant="ghost"
                                className="p-0 h-min"
                                onClick={() => {
                                    setSocials(
                                        socials.filter((_, i) => i !== index),
                                    );
                                }}
                            >
                                <X />
                            </Button>
                        </div>
                    ))}
                </div>
            </section>
            <section className="space-y-2 w-full m-4" id="about">
                <h2 className="text-2xl font-semibold ml-2 font-primary">
                    About you
                </h2>
                <TextareaAutosize
                    name="about"
                    minRows={5}
                    rows={10}
                    maxRows={20}
                    maxLength={10000}
                    placeholder="Tell us something about you! 🧐"
                    className="bg-base-300 rounded-xl w-full p-4"
                    defaultValue={dashboard.portfolio.about}
                />
            </section>
            <Button
                type="submit"
                variant="secondary"
                className="rounded-[4px] w-20 mb-4"
                disabled={isSaving}
            >
                Save {isSaving && <Loader />}
            </Button>
        </form>
    );
}
