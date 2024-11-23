export type AuthStatus = 'unauthorized' | 'authorized';

export interface Portfolio {
    website: string;
    strictOrigin: boolean;
    socials: string[];
    about: string;
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface Model {
    name: string;
    safe: boolean;
    temperature: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

export interface MessageCounter {
    date: Date;
    count: number;
}

export interface MistralModel {
    id: string;
    object: 'model';
    created: number;
    name: string;
    description: string;
    owned_by: string;
    max_context_length: number;
    capabilities: {
        completion_chat: boolean;
        completion_fim: boolean;
        function_calling: boolean;
        fine_tuning: boolean;
        vision: boolean;
    };
    deprecation: null;
    aliases: string[];
    default_model_temperature: number;
    type: 'base';
}

export interface Dashboard {
    clientId: string;
    model: Model;
    portfolio: Portfolio;
    messagesCounter: MessageCounter[];
}

export type ActionResults =
    | { success: true; error?: undefined }
    | { success: false; error: string[] };
