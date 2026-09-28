const OpenAI = require('openai');

let openrouter;

function getOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured.');
    }

    if (!openrouter) {
        openrouter = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey
        });
    }

    return openrouter;
}

function getOpenRouterModel() {
    const model = process.env.OPENROUTER_MODEL;
    if (!model) {
        throw new Error('OPENROUTER_MODEL is not configured.');
    }
    return model;
}

module.exports = {
    getOpenRouter,
    getOpenRouterModel
};
