import React from 'react';
import { cn } from '~/lib/utils';

type BadgeType = 'success' | 'info' | 'warning' | 'danger';

const classNames: Record<BadgeType, string> = {
    info: 'border-blue-800/90 bg-blue-500/60',
    success: 'border-green-800/90 bg-green-500/60',
    warning: 'border-yellow-800/90 bg-yellow-500/60',
    danger: 'border-red-800/90 bg-red-500/60',
} as const;

interface BadgeProps extends React.HTMLProps<HTMLDivElement> {
    variant?: BadgeType;
}

export function Badge({ variant = 'info', className, ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'rounded-full px-2 py-0.5 text-[0.85em] border font-semibold',
                classNames[variant],
                className,
            )}
            {...props}
        />
    );
}
