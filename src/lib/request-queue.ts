import type { NextRequest } from 'next/server';

export class RequestQueue {
    private readonly queue = new Set<() => void>();
    public processing = false;

    constructor(public readonly limit: number) {}

    public schedule(request: NextRequest) {
        let isCompleted = false;

        return new Promise<() => void>(async (resolve) => {
            const response = () => resolve(onComplete);

            this.queue.add(response);

            const onComplete = () => {
                if (isCompleted) return;
                isCompleted = true;

                request.signal.removeEventListener('abort', onComplete);

                setTimeout(() => {
                    this.queue.delete(response);

                    const next = this.queue.values()?.next?.()?.value;

                    this.processing = !!next;
                    next?.();
                }, 2000);
            };

            request.signal.addEventListener('abort', onComplete);

            if (!this.processing) {
                response();
                this.processing = true;
            }
        });
    }
}
