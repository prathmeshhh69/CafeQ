const {
    generateFrequentItemsetsFromCompletedOrders,
    generateAssociationRules,
    generateRecommendations,
    enhanceRecommendations,
    enhanceRecommendationsWithUserContext
} = require('../services/recommendation.service');

function parseNumber(value) {
    if (value === undefined) {
        return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : value;
}

async function getRecommendations(req, res) {
    try {
        const requestData = req.body || {};
        const inputMenuItems = Array.isArray(requestData.menuItems)
            ? requestData.menuItems
            : [];
        const minimumSupport = parseNumber(requestData.minimumSupport);
        const minimumConfidence = parseNumber(requestData.minimumConfidence);
        const minimumLift = parseNumber(requestData.minimumLift);
        const rebuyWeight = parseNumber(requestData.rebuyWeight);
        const temporalWeight = parseNumber(requestData.temporalWeight);
        const referenceDate = requestData.referenceDate
            ? new Date(requestData.referenceDate)
            : undefined;

        const frequentItemsets = await generateFrequentItemsetsFromCompletedOrders(
            minimumSupport === undefined ? 0.5 : minimumSupport
        );
        const associationRules = generateAssociationRules(frequentItemsets, {
            minimumSupport: minimumSupport === undefined ? 0 : minimumSupport,
            minimumConfidence: minimumConfidence === undefined ? 0 : minimumConfidence,
            minimumLift: minimumLift === undefined ? 0 : minimumLift
        });
        const recommendations = generateRecommendations(inputMenuItems, associationRules);
        const ratedAndAvailableRecommendations = await enhanceRecommendations(recommendations);
        const finalRecommendations = await enhanceRecommendationsWithUserContext(
            ratedAndAvailableRecommendations,
            req.user && req.user._id,
            {
                ...(rebuyWeight === undefined ? {} : { rebuyWeight }),
                ...(temporalWeight === undefined ? {} : { temporalWeight }),
                ...(referenceDate === undefined ? {} : { referenceDate })
            }
        );

        return res.status(200).json({
            recommendations: finalRecommendations
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Unable to generate recommendations'
        });
    }
}

module.exports = { getRecommendations };
