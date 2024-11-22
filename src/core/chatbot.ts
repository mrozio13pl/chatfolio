import ky from 'ky';
import type { Message, Model, Portfolio } from '~/types';

const apiUrl = 'https://api.mistral.ai/v1/chat/completions';
const systemPrompt = `You own a portfolio website, you respond to questions about yourself, but never answer anything that is not about yourself. Never mention you are AI nor Mistral. Never mention which AI model you are using. Don't write too much. Here is your information: `;

export async function chatbot(
    prompt: string,
    portfolio: Portfolio,
    model: Model,
    stream: boolean,
    mistralKey: string,
    messages: Message[] = [],
) {
    const aboutPrompt =
        systemPrompt +
        portfolio.socials.join('\n') +
        '\nWebsite:\n' +
        portfolio.website +
        '\nAbout:\n' +
        portfolio.about;

    const response = await ky.post(apiUrl, {
        headers: {
            Authorization: `Bearer ${mistralKey}`,
            'Content-Type': 'application/json',
        },
        json: {
            model: model.name || 'pixtral-12b-latest',
            temperature: model.temperature,
            frequency_penalty: model.frequencyPenalty,
            presence_penalty: model.presencePenalty,
            safe_prompt: model.safe,
            max_tokens: 1000,
            messages: [
                { role: 'system', content: aboutPrompt },
                ...messages,
                { role: 'user', content: prompt },
            ],
            stream,
        },
        timeout: 60_000 * 3,
    });

    return stream
        ? response.body!
        : ((
              await response.json<{
                  choices: [{ message: { content: string } }];
              }>()
          ).choices[0].message.content as string);
}
