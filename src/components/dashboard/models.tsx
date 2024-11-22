'use client';

import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';
import type { MistralModel } from '~/types';
import { DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';

export function Models({
    selectedModel,
    onSelect,
}: {
    selectedModel: string;
    onSelect: (model: MistralModel) => void;
}) {
    const [models, setModels] = useState<MistralModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    async function fetchModels() {
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatfolio/models');
            const data = await response.json();
            setModels(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch models');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchModels();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="overflow-y-auto max-h-[50vh]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[300px]">Description</TableHead>
                        <TableHead className="w-[100px]">
                            Max Context Length
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {models.map((model) => (
                        <TableRow
                            key={model.id}
                            className={clsx(
                                'text-content-100 hover:bg-base-200',
                                model.id === selectedModel && 'bg-base-200',
                            )}
                        >
                            <TableCell className="font-bold">
                                {model.id}
                            </TableCell>
                            <TableCell>{model.name}</TableCell>
                            <TableCell className="text-content-200">
                                {model.description}
                            </TableCell>
                            <TableCell>{model.max_context_length}</TableCell>
                            <TableCell>
                                <DialogClose>
                                    <Button
                                        variant="secondary"
                                        onClick={() => onSelect(model)}
                                    >
                                        Select
                                    </Button>
                                </DialogClose>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
