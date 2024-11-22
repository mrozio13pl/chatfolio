'use client';

import React, { useEffect, useState } from 'react';
import { SquarePen } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Section } from '~/components/section';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog';
import { useSession } from '~/providers/session';
import { Models } from '~/components/dashboard/models';
import { Checkbox } from '~/components/ui/checkbox';
import { SliderWithLabel } from '~/components/dashboard/slider-with-label';
import { Loader } from '~/components/loader';
import { useDashboard } from '~/hooks/dashboard';
import { formToObject } from '~/lib/form-to-object';
import { saveModel } from '~/actions/portfolio';
import { toast } from 'sonner';

export default function ModelPage() {
    const { status } = useSession();
    const { dashboard } = useDashboard();
    const [isSaving, setIsSaving] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');

    useEffect(() => {
        console.log(dashboard);
        if (!dashboard) return;

        setSelectedModel(dashboard.model.name);
    }, [dashboard]);

    async function save(form: FormData) {
        setIsSaving(true);

        const data = formToObject(form, { boolean: ['safe'] });
        const { success, error } = await saveModel(data);

        setIsSaving(false);

        if (success) {
            toast.success('Saved successfully!');
        } else {
            error.forEach((e) => toast.error(e));
        }
    }

    if (status === 'unauthorized' || !dashboard) {
        return (
            <Section>
                <h2 className="text-2xl">Loading...</h2>
            </Section>
        );
    }

    return (
        <Section className="min-h-min min-w-full">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    save(formData);
                }}
                className="flex flex-col items-center justify-start w-full"
            >
                <input
                    type="text"
                    value={selectedModel}
                    className="hidden"
                    name="name"
                    readOnly
                />
                <div className="space-y-2 w-full m-4">
                    <div className="ml-2">
                        <h2 className="text-2xl font-semibold font-primary">
                            Choose a model
                        </h2>
                        <p className="text-content-300">
                            Pick a model to use for your chatbot.
                        </p>
                        <div className="flex gap-2 items-center">
                            <p>{selectedModel}</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost">
                                        Edit <SquarePen />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Choose your model
                                        </DialogTitle>
                                        <DialogDescription>
                                            Pick a model to use for your
                                            chatbot.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Models
                                        selectedModel={selectedModel || ''}
                                        onSelect={(model) =>
                                            setSelectedModel(model.id)
                                        }
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
                <div className="space-y-2 w-full m-4">
                    <div className="ml-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-semibold font-primary">
                                Safe Mode
                            </h2>
                            <Checkbox
                                name="safe"
                                defaultChecked={dashboard.model.safe}
                            />
                        </div>
                        <p className="text-content-300">
                            Whether to inject a safety prompt before all
                            conversations.
                        </p>
                    </div>
                </div>
                <div className="space-y-2 w-full m-4 !ml-8">
                    <h2 className="text-2xl font-semibold font-primary">
                        Temperature
                    </h2>
                    <p className="text-content-300">
                        Model&apos;s randomness and creativity.
                    </p>
                    <SliderWithLabel
                        min={0}
                        max={1.5}
                        step={0.05}
                        name="temperature"
                        defaultValue={[dashboard.model.temperature]}
                    />
                </div>
                <div className="space-y-2 w-full m-4 !ml-8">
                    <h2 className="text-2xl font-semibold font-primary">
                        Frequency Penalty
                    </h2>
                    <p className="text-content-300">
                        Punish the model for repeating itself. A higher
                        frequency penalty reduces repeatition of words that have
                        already appeared frequently in the output, promoting
                        diversity and reducing repetition.
                    </p>
                    <SliderWithLabel
                        min={-2}
                        max={2}
                        step={0.05}
                        name="frequencyPenalty"
                        defaultValue={[dashboard.model.frequencyPenalty]}
                    />
                </div>
                <div className="space-y-2 w-full m-4 !ml-8">
                    <h2 className="text-2xl font-semibold font-primary">
                        Presence Penalty
                    </h2>
                    <p className="text-content-300">
                        Determine how much the model penalizes itself for the
                        repetition of words and phrases. A higher presence
                        penalty encourages the model to use a wider variety of
                        words and phrases, making the output more diverse and
                        creative.
                    </p>
                    <SliderWithLabel
                        min={-2}
                        max={2}
                        step={0.05}
                        name="presencePenalty"
                        defaultValue={[dashboard.model.presencePenalty]}
                    />
                </div>
                <Button
                    type="submit"
                    variant="secondary"
                    className="rounded-[4px] w-20 mb-4"
                    disabled={isSaving}
                >
                    Save {isSaving && <Loader />}
                </Button>
            </form>
        </Section>
    );
}
