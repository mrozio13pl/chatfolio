import React, { useState } from 'react';
import { Button, type ButtonProps } from '../ui/button';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { Loader } from '../loader';

export function AuthButton({
    children,
    className,
    onClick,
    icon,
    ...props
}: ButtonProps & { icon: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handler(event: never) {
        setIsLoading(true);

        try {
            await onClick?.(event);
        } catch (error) {
            console.error(error);
            toast.error('Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            className={cn(
                'flex items-center p-4 bg-slate-50 text-black !rounded-xl w-64 h-12 hover:bg-slate-200',
                className,
            )}
            onClick={handler}
            {...props}
        >
            {isLoading ? <Loader /> : icon}

            {children}
        </Button>
    );
}
