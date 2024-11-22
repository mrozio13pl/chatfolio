import mongoose from 'mongoose';

export const connectMongoose = async () => {
    if (!process.env.MONGODB_URI!) {
        throw new Error(
            'Add the MONGODB_URI environment variable inside .env to use mongoose',
        );
    }

    await mongoose
        .connect(process.env.MONGODB_URI!)
        .catch((e) => console.error('Mongoose Client Error: ' + e.message));
};
