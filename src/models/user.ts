import mongoose from 'mongoose';
import ms from 'ms';
import { nanoid } from 'nanoid';
import { generateIdFromEntropySize } from 'lucia';
import type { Chat, Message, MessageCounter, Model, Portfolio } from '~/types';

export interface User {
    _id: string;
    id?: string;
    email: string;
    verified_email?: boolean;
    name: string;
    picture: string;
    clientId: string;
    portfolio: Portfolio;
    model: Model;
    mistralKey?: string;
    chats: Chat[];
    messagesCounter: MessageCounter[];
}

const messagesCounterSchema = new mongoose.Schema(
    {
        date: { type: Date, default: Date.now },
        count: { type: Number, default: 0 },
    },
    {
        _id: false,
    },
);

const messageSchema = new mongoose.Schema<Message>(
    {
        role: {
            type: String,
            enum: ['assistant', 'user'] satisfies Message['role'][],
        },
        content: { type: String, trim: true },
    },
    { _id: false },
);

const chatSchema = new mongoose.Schema(
    {
        date: { type: Date, default: Date.now },
        messages: [messageSchema],
    },
    { _id: false },
);

const portfolioSchema = new mongoose.Schema<Portfolio>(
    {
        website: {
            type: String,
            maxlength: 255,
        },
        strictOrigin: { type: Boolean, default: true },
        socials: {
            type: [{ type: String, maxlength: 100 }],
            default: [],
            maxlength: 100,
        },
        about: { type: String, default: '', maxlength: 10000 },
    },
    { _id: false },
);

const modelSchema = new mongoose.Schema<Model>(
    {
        name: { type: String, default: 'pixtral-12b-latest' },
        safe: { type: Boolean, default: false },
        temperature: { type: Number, default: 0.5 },
        frequencyPenalty: { type: Number, default: 0 },
        presencePenalty: { type: Number, default: 0 },
    },
    { _id: false },
);

const userSchema = new mongoose.Schema<User>(
    {
        // this field is only for google ids
        _id: { type: String, default: () => generateIdFromEntropySize(10) },
        id: { type: String, required: false },
        name: { type: String, trim: true, required: false },
        email: { type: String, trim: true, required: true, unique: true },
        picture: { type: String, trim: true, required: false },
        verified_email: { type: Boolean, required: false },
        clientId: { type: String, unique: true, default: () => nanoid() },
        portfolio: { type: portfolioSchema, default: () => ({}) },
        model: { type: modelSchema, default: () => ({}) },
        mistralKey: { type: String, trim: true, required: false },
        chats: { type: [chatSchema], default: [] },
        messagesCounter: { type: [messagesCounterSchema], default: [] },
    },
    {
        _id: false,
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    const now = new Date();

    if (this.chats) {
        this.chats = this.chats.filter((chat) => {
            const daysOld = (now.getTime() - chat.date.getTime()) / ms('1d');
            return daysOld <= 7;
        });
    }

    if (this.messagesCounter) {
        this.messagesCounter = this.messagesCounter.filter((message) => {
            const daysOld = (now.getTime() - message.date.getTime()) / ms('1d');
            return daysOld <= 30;
        });
    }

    next();
});

export const UserModel =
    mongoose.models.users<User> || mongoose.model<User>('users', userSchema);
