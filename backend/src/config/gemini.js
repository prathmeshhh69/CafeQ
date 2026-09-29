const OpenAI = require('openai');

let gemini;

function getGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
    }

    if (!gemini) {
        gemini = new OpenAI({
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            apiKey
        });
    }

    return gemini;
}

function getGeminiModel() {
    const model = process.env.GEMINI_MODEL;
    if (!model) {
        throw new Error('GEMINI_MODEL is not configured.');
    }
    return model;
}

module.exports = {
    getGemini,
    getGeminiModel
};
