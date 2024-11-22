import mongoose from 'mongoose';

export const SessionModel =
    mongoose.models.sessions ||
    mongoose.model(
        'sessions',
        new mongoose.Schema(
            {
                _id: {
                    type: String,
                    required: true,
                },
                user_id: {
                    type: String,
                    required: true,
                },
                expires_at: {
                    type: Date,
                    required: true,
                },
            } as const,
            { _id: false },
        ),
    );
