import { GitHub } from 'arctic';
import { joinURL } from 'ufo';

export const githubProvider = new GitHub(
    process.env.GITHUB_ID!,
    process.env.GITHUB_SECRET!,
    joinURL(process.env.SITE_URL!, 'api/auth/github/callback'),
);
