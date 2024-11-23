import { NextResponse, type NextRequest } from 'next/server';
import { chatbot } from '~/core/chatbot';
import { connectMongoose } from '~/lib/mongoose';
import { decrypt } from '~/lib/hash';
import { getDomainFromUrl, getRequestOrigin, isLocalhost } from '~/lib/url';
import { UserModel } from '~/models/user';
import { isEqual } from 'ufo';
import * as v from 'valibot';
import type { Model, Portfolio } from '~/types';
import { RequestQueue } from '~/lib/request-queue';
import { HTTPError } from 'ky';

enum Role {
    User = 'user',
    Assistant = 'assistant',
}

const messageSchema = v.objectAsync({
    message: v.string('Missing message'),
    messages: v.optional(
        v.array(
            v.object({
                role: v.enum(
                    Role,
                    "Invalid role, should be 'user' or 'assistant'",
                ),
                content: v.string('Missing message content'),
            }),
        ),
    ),
    clientId: v.pipeAsync(
        v.string('Missing clientId'),
        v.customAsync(async (clientId) => {
            if (clientId === 'demo') {
                return true;
            }

            await connectMongoose();

            const user = await UserModel.findOne({ clientId });

            return !!user;
        }, 'Invalid clientId'),
    ),
    stream: v.optional(v.boolean('Stream should be boolean'), false),
});

const demoModel: Model = {
    name: 'pixtral-12b-latest',
    safe: true,
    temperature: 0.3,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
};

const demoPortfolio: Portfolio = {
    website: 'chatfolio.me',
    socials: ['https://github.com/mrozio13pl'],
    about: `
Hi, I’m Alex Greenwood, 33 y/o a software engineer based in Austin, Texas—a city where tech meets tacos, and I indulge in both daily. I’ve been coding for over a decade, though if we’re counting my first “Hello, World!” printed on my family’s dinosaur of a PC, it’s closer to two. I’m passionate about crafting intuitive software, solving complex problems, and occasionally explaining to non-tech friends why their Wi-Fi isn’t working (spoiler: it’s always the router).

I consider myself a bit of a programming nerd in the best way possible. My happy place is refactoring code that others have abandoned out of frustration—it’s like solving a puzzle but with higher stakes and more semicolons. I’m particularly obsessed with clean, readable code and take pride in writing functions so clear they could double as bedtime stories. I’m a huge advocate for test-driven development, though I’ll admit, I sometimes write the tests after the code when inspiration strikes faster than discipline.

In terms of what I’m nerdy about in tech, let’s just say my GitHub commit messages have been described as “a cry for help” because of how frequently I optimize the tiniest things. I’m deeply interested in backend architecture, APIs, and building scalable systems. I’ve been known to spend hours debating whether a microservices or monolithic approach is better—usually with my dog, who seems to prefer monoliths. On the frontend, I love tinkering with React and obsessing over pixel-perfect designs. If you hear me shouting “why is this margin off by 1px?” from across the office, just assume I’ve fallen down the CSS rabbit hole again.

Outside of work, I’m a proud board game enthusiast and an amateur baker, though my cakes tend to look more like failed software deployments than Pinterest-worthy creations. I love traveling and have a personal project where I try to visit every country that has reliable Wi-Fi. My personal life isn’t all keyboards and caffeine—I have a partner who patiently listens to my tech rants and a rescue dog named Bugsy (yes, named after software bugs).

What I value most about programming is the constant learning. There’s always something new to dive into—whether it’s understanding the latest JavaScript framework or figuring out why Docker containers hate me this week. I thrive on tackling the impossible, even if it sometimes feels like I’m shouting at an indifferent compiler.

So, if you’re looking for a programmer who can write clean code, debug with persistence, and bring humor to even the longest sprint meetings, I’m your person. And if you’re not looking for that? Well, I’ll still be here, coding away and probably eating tacos.`,
};

const mainQueue = new RequestQueue(1000);
const apiKeysQueues = new Map<string, RequestQueue>();

export async function POST(req: NextRequest) {
    const data = await req.json();
    const { output, success, issues } = await v.safeParseAsync(
        messageSchema,
        data,
    );

    if (!success) {
        return NextResponse.json({ success: false, issues }, { status: 422 });
    }

    const { message, messages, clientId, stream: isStream } = output;

    await connectMongoose();

    const user =
        clientId === 'demo'
            ? { portfolio: demoPortfolio, model: demoModel }
            : await UserModel.findOne({ clientId })!;

    const origin = getRequestOrigin(req);

    if (
        user.portfolio.website &&
        // we let thru requests without any origin
        origin &&
        !isEqual(origin, getDomainFromUrl(process.env.SITE_URL!)) &&
        !isLocalhost(origin) &&
        !isEqual(origin, user.portfolio.website)
    ) {
        return NextResponse.json(
            { success: false, message: 'Invalid origin' },
            { status: 403 },
        );
    }

    const mistralKey = user.mistralKey
        ? decrypt(user.mistralKey)
        : process.env.MISTRAL_API_KEY!;

    let onComplete: () => void;

    console.log(1);
    if (user.mistralKey) {
        const queue = apiKeysQueues.has(mistralKey)
            ? apiKeysQueues.get(mistralKey)!
            : apiKeysQueues
                  .set(mistralKey, new RequestQueue(2000))
                  .get(mistralKey)!;
        onComplete = await queue.schedule(req);
        onComplete = () => {
            onComplete();
            setTimeout(() => {
                if (!queue.processing) {
                    apiKeysQueues.delete(mistralKey);
                }
            }, queue.limit);
        };
    } else {
        onComplete = await mainQueue.schedule(req);
    }

    console.log(2);

    try {
        const stream = await chatbot(
            message.slice(0, 1000),
            user.portfolio,
            user.model,
            isStream,
            mistralKey,
            messages,
        );
        onComplete();

        if (isStream && typeof stream !== 'string') {
            return new NextResponse(
                new ReadableStream({
                    async start(controller) {
                        const reader = stream.getReader();
                        const decoder = new TextDecoder('utf-8');
                        let buffer = '';
                        let done = false;
                        while (!done) {
                            const { value, done: readerDone } =
                                await reader.read();
                            done = readerDone;
                            if (value) {
                                buffer += decoder.decode(value, {
                                    stream: true,
                                });
                                let boundary;
                                while (
                                    (boundary = buffer.indexOf('\n')) !== -1
                                ) {
                                    const chunk = buffer
                                        .slice(0, boundary)
                                        .trim();
                                    buffer = buffer.slice(boundary + 1);
                                    if (chunk) {
                                        if (
                                            chunk?.replace('data: ', '') ===
                                            '[DONE]'
                                        ) {
                                            done = true;
                                            break;
                                        }

                                        const parsedData = JSON.parse(
                                            chunk.replace('data: ', ''),
                                        );
                                        const { content } =
                                            parsedData?.choices?.[0]?.delta ||
                                            {};

                                        if (content) {
                                            // process.stdout.write(content);
                                            controller.enqueue(content);
                                        }
                                    }
                                }
                            }
                        }

                        controller.close();
                    },
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
        } else {
            return NextResponse.json({ success: true, content: stream });
        }
    } catch (error: any) {
        if (error instanceof HTTPError) {
            if (error.response.status === 429) {
                return NextResponse.json(
                    { success: false, message: 'Rate limit exceeded' },
                    { status: 429 },
                );
            }
        }

        return new NextResponse(void 0, { status: 500 });
    } finally {
        onComplete();
    }
}
