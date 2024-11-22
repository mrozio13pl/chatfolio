import clsx from 'clsx';
import { Dot } from 'lucide-react';

export function Status({ status }: { status: number }) {
    let className = '';

    if (status < 200) {
        className = 'text-blue-500';
    } else if (status >= 200 && status < 300) {
        className = 'text-green-500';
    } else if (status >= 300 && status < 400) {
        className = 'text-yellow-500';
    } else if (status >= 400) {
        className = 'text-red-500';
    }

    return (
        <span className="flex items-center">
            <Dot className={clsx('size-12 -m-4 pr-1', className)} /> {status}
        </span>
    );
}
