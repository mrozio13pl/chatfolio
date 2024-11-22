import ky from 'ky';

export const api = ky.create({
    prefixUrl: '/api/',
    next: { revalidate: 0 },
    cache: 'no-store',
    timeout: 30_000,
});
