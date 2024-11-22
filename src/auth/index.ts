import mongoose from 'mongoose';
import { Lucia, TimeSpan } from 'lucia';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import type { User as TUserModel } from '~/models/user';

export const auth = new Lucia(
    new MongodbAdapter(
        mongoose.connection.collection('sessions') as any,
        mongoose.connection.collection('users') as any,
    ),
    {
        // @ts-expect-error wrong type
        getUserAttributes: (user: TUserModel) => {
            return {
                name: user.name,
                email: user.email,
                image: user.picture,
            };
        },
        sessionCookie: {
            name: 'user_session',
            expires: true,
            attributes: {
                sameSite: 'none',
                path: '/',
            },
        },
        sessionExpiresIn: new TimeSpan(7, 'd'),
    },
);

export type Auth = typeof auth;

declare module 'lucia' {
    interface Register {
        Lucia: typeof auth;
    }
}
