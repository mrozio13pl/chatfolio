'use server';

import * as v from 'valibot';
import { UserModel } from '~/models/user';
import { getSession } from '~/auth/get-session';
import { getModels } from '~/lib/get-models';
import {
    addProtocolToDomain,
    getDomainFromUrl,
    isLocalhost,
    isValidDomain,
    withoutProtocol,
} from '~/lib/url';
import type { ActionResults } from '~/types';

const socialLinksSchema = v.optional(
    v.union([
        v.array(
            v.pipe(v.string(), v.maxLength(255, 'Social link is too long')),
        ),
        v.string(),
    ]),
    [],
);

const portfolioSchema = v.objectAsync({
    website: v.unionAsync(
        [
            v.pipeAsync(
                v.string(),
                v.customAsync<string>(async (value) => {
                    return !isLocalhost(value as string);
                }, 'Website can not be localhost'),
                v.custom<string>(
                    (value) => isValidDomain(value as string),
                    'Invalid domain',
                ),
                v.transform(getDomainFromUrl),
                v.transform(addProtocolToDomain),
                v.url('Invalid website'),
                v.transform(withoutProtocol),
                v.maxLength(255, 'Website is too long'),
            ),
            v.literal(''),
        ],
        'Invalid domain',
    ),
    strictOrigin: v.optional(v.boolean(), false),
    socials: socialLinksSchema,
    about: v.pipe(v.string(), v.maxLength(10000, 'About is too long')),
});

const modelSchema = v.objectAsync({
    name: v.customAsync<string>(async (name) => {
        const models = await getModels();
        return !!models.find((m) => m.id === name);
    }, 'Invalid model!'),
    safe: v.optional(v.boolean(), false),
    temperature: v.pipe(v.number(), v.minValue(0), v.maxValue(1.5)),
    frequencyPenalty: v.pipe(v.number(), v.minValue(-2), v.maxValue(2)),
    presencePenalty: v.pipe(v.number(), v.minValue(-2), v.maxValue(2)),
});

export async function saveModel(data: any): Promise<ActionResults> {
    const { user, session, status } = await getSession();

    if (status !== 'authorized' || !session || !user) {
        return { success: false, error: ['Unauthorized'] };
    }

    const {
        success,
        output: model,
        issues,
    } = await v.safeParseAsync(modelSchema, data);

    if (!success) {
        return { success: false, error: issues.map((i) => i.message) };
    }

    const userModel = await UserModel.findById(user.id);

    if (!userModel) {
        return { success: false, error: ['User not found'] };
    }

    userModel.model = model;
    await userModel.save();

    return { success: true };
}

export async function savePortfolio(data: any): Promise<ActionResults> {
    const { user, session, status } = await getSession();

    if (status !== 'authorized' || !session || !user) {
        return { success: false, error: ['Unauthorized'] };
    }

    const {
        success,
        output: portfolio,
        issues,
    } = await v.safeParseAsync(portfolioSchema, data);

    if (!success) {
        return { success: false, error: issues.map((i) => i.message) };
    }

    const userModel = await UserModel.findById(user.id);

    if (!userModel) {
        return { success: false, error: ['User not found'] };
    }

    userModel.portfolio = portfolio;
    await userModel.save();

    return { success: true };
}
