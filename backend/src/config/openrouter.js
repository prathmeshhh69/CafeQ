const OpenAI = require('openai');

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
});

const defaultModel = process.env.OPENROUTER_MODEL;

module.exports = {
    openrouter,
    model: defaultModel
};
