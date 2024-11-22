'use server';

import { UserModel } from '~/models/user';
import { getSession } from '~/auth/get-session';
import { getModels } from '~/lib/get-models';
import { encrypt } from '~/lib/hash';

export async function saveMistralKey(key: string) {
    const { user, session, status } = await getSession();

    if (status !== 'authorized' || !session || !user) {
        return { success: false, error: ['Unauthorized'] };
    }

    const userModel = await UserModel.findById(user.id);

    if (!userModel) {
        return { success: false, error: 'User not found' };
    }

    if (!key) {
        userModel.mistralKey = void 0;
        await userModel.save();

        return { success: true };
    }

    try {
        // verify key
        await getModels(key);

        userModel.mistralKey = encrypt(key);
        await userModel.save();

        return { success: true };
    } catch {
        return { success: false, error: 'Invalid API key.' };
    }
}
