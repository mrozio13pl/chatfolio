import { Google } from 'arctic';
import { joinURL } from 'ufo';

export const googleProvider = new Google(
    process.env.GOOGLE_ID!,
    process.env.GOOGLE_SECRET!,
    joinURL(process.env.SITE_URL!, 'api/auth/google/callback'),
);
