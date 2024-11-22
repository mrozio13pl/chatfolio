import ky from 'ky';
import type { MistralModel } from '~/types';

const cachedModels: { date: number; data: MistralModel[] } = {
    date: 0,
    data: [],
};

export async function getModels(apiKey?: string) {
    if (!apiKey && cachedModels.date > new Date().getTime()) {
        return cachedModels.data;
    }

    const { data: models } = await ky
        .get('https://api.mistral.ai/v1/models', {
            headers: {
                Authorization: `Bearer ${
                    apiKey || process.env.MISTRAL_API_KEY
                }`,
            },
        })
        .json<{ data: MistralModel[] }>();

    cachedModels.data = models;
    cachedModels.date = new Date().getTime() + 1000 * 60 * 5;

    return models;
}
