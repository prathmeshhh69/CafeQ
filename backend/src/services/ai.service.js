const { openrouter, model } = require('../config/openrouter');

async function getFoodRecommendations({ customerMessage, availableMenuItems = [], aprioriRecommendations = [] }) {
    if (!model) {
        throw new Error('OPENROUTER_MODEL is not configured.');
    }

    const systemPrompt = `You are a helpful food recommendation assistant for CafeQ.
Your goal is to recommend menu items to the customer based on their request while extracting any explicit constraints they specify.

CONSTRAINT EXTRACTION RULES:
1. "maxPrice": If the customer specifies an upper budget or price limit (e.g., "under ₹120", "below 200", "less than ₹150", "within 100", "max 250"), extract it as a numeric value. Otherwise, set it to null.
2. "diet": If the customer specifies a dietary constraint, extract it as exactly "vegetarian" or "non-vegetarian". Otherwise, set it to null.
3. "category": If the customer explicitly asks for a specific food or drink category (e.g., "Shawarma", "Coffee", "Mojito", "Lassi", "Juice", "Ice Cream", "Shake"), extract the category string. Otherwise, set it to null.
4. Do NOT invent constraints if the customer did not express them.

RECOMMENDATION LIMITS & SELECTION RULES:
1. Return UP TO 10 recommendations. Do NOT force exactly 10 recommendations.
2. If only a few items (e.g. 1 to 3) genuinely match the customer's request and constraints, return ONLY those.
3. NEVER pad recommendations with weak, irrelevant, or unrelated matches just to reach a higher count.
4. If no items match the request, return an empty array for "recommendations" and explain politely in "message".

SEMANTIC MATCHING & CONSTRAINT PRINCIPLES:
1. Accurately understand and respect the customer's intent, flavor preferences, and constraints (e.g., spicy, vegetarian, non-vegetarian, category, budget/price).
2. For specific flavor profiles like "spicy", prioritize items whose names, categories, or descriptions clearly indicate spicy characteristics (e.g. chili, pepper, masala, schezwan, spicy sauce).
3. Do NOT classify an item as spicy simply because it has strong, bold, cheesy, rich, tangy, or refreshing flavors.
4. Apply the same strict matching standard to other dietary or thematic constraints (e.g., do not suggest non-vegetarian items for vegetarian requests).

STRICT CONSTRAINTS:
1. You may ONLY recommend items present in the provided Available Menu Items list.
2. Under NO circumstances should you invent, hallucinate, or recommend any menu item or menuItemId that is not in the list.
3. Do NOT invent prices, ingredients, or availability.
4. Do NOT calculate prices or totals.
5. Use "aprioriRecommendations" as optional supporting context if relevant, but prioritize genuinely matching the customer's request from Available Menu Items.
6. Your response MUST be valid JSON only, without any markdown formatting, backticks, or commentary, following this exact schema:
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

    const userPrompt = `Customer Request: "${customerMessage || ''}"

Available Menu Items:
${JSON.stringify(availableMenuItems, null, 2)}

Optional Apriori Recommendations (Supporting Context):
${JSON.stringify(aprioriRecommendations, null, 2)}

Provide your response in the specified JSON format.`;

    let completion;
    try {
        completion = await openrouter.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
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
