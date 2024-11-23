import { generateIdFromEntropySize } from 'lucia';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import type { Model, Portfolio } from '~/types';

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
}

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
    },
    {
        _id: false,
        timestamps: true,
    },
);

export const UserModel =
    mongoose.models.users<User> || mongoose.model<User>('users', userSchema);
