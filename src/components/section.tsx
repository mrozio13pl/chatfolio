import React, { forwardRef } from 'react';
import { cn } from '~/lib/utils';

// eslint-disable-next-line react/display-name
export const Section = forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    return (
        <section
            ref={ref}
            className={cn(
                'min-w-full min-h-screen flex flex-col justify-center items-center bg-base-900',
                className,
            )}
            {...props}
        >
            {children}
        </section>
    );
});
