const { getOpenRouter, getOpenRouterModel } = require('../config/openrouter');

async function getFoodRecommendations({ customerMessage, availableMenuItems = [], aprioriRecommendations = [] }) {
    const model = getOpenRouterModel();
    const openrouter = getOpenRouter();

    const systemPrompt = `You are CafeQ's food recommendation assistant. Match the customer's request against the supplied menu.

Extract only explicit constraints:
- maxPrice: numeric upper budget, otherwise null.
- diet: exactly "vegetarian" or "non-vegetarian", otherwise null.
- category: an explicitly requested menu category, otherwise null.

Recommend at most 6 genuinely relevant items. Respect price, diet, category, and flavor requests. For "spicy", prefer names or categories that clearly indicate chili, pepper, masala, schezwan, or spicy sauce. Never pad the list. If nothing matches, return an empty recommendations array and a short explanation.

Only use items and IDs from Available Menu Items. Never invent items, IDs, prices, ingredients, availability, or totals. Optional Apriori Recommendations are supporting context only.

Return valid JSON only, with no markdown, using this schema:
{
  "message": "short helpful response",
  "constraints": {
    "maxPrice": null,
    "diet": null,
    "category": null
  },
  "recommendations": [
    {
      "menuItemId": "existing menu item id",
      "reason": "short recommendation reason"
    }
  ]
}`;

    const aprioriContext = aprioriRecommendations.length
        ? `\nOptional Apriori Recommendations: ${JSON.stringify(aprioriRecommendations)}`
        : '';
    const userPrompt = `Customer Request: ${JSON.stringify(customerMessage || '')}
Available Menu Items: ${JSON.stringify(availableMenuItems)}${aprioriContext}`;

    let completion;
    try {
        completion = await openrouter.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 600
        });
    } catch (apiError) {
        throw new Error(`OpenRouter API request failed: ${apiError.message}`);
    }

    const rawContent = completion?.choices?.[0]?.message?.content;
    if (!rawContent) {
        throw new Error('No response content received from OpenRouter.');
    }

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(rawContent.trim());
    } catch (parseError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    return parsedResponse;
}

module.exports = {
    getFoodRecommendations
};
