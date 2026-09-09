const orderModel = require('../models/order.model');
const menuModel = require('../models/menu.model');
const inventoryModel = require('../models/inventory.model');
const reviewModel = require('../models/review.model');

async function extractCompletedTransactions() {
    const completedOrders = await orderModel.find({ orderStatus: 'COMPLETED' })
        .select('items.menuItem')
        .lean();

    return completedOrders.map(order => {
        const uniqueMenuItems = new Map();

        for (const item of order.items || []) {
            if (item.menuItem) {
                uniqueMenuItems.set(item.menuItem.toString(), item.menuItem);
            }
        }

        return Array.from(uniqueMenuItems.values());
    });
}

function getItemsetKey(itemset) {
    return itemset.map(item => item.toString()).join('|');
}

function calculateSupport(itemset, transactions) {
    if (transactions.length === 0 || itemset.length === 0) {
        return 0;
    }

    const matchingTransactions = transactions.filter(transaction => {
        const transactionItems = new Set(transaction.map(item => item.toString()));
        return itemset.every(item => transactionItems.has(item.toString()));
    });

    return matchingTransactions.length / transactions.length;
}

function generateCandidates(frequentItemsets, itemsetSize) {
    const candidates = new Map();

    for (let firstIndex = 0; firstIndex < frequentItemsets.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < frequentItemsets.length; secondIndex += 1) {
            const firstItemset = frequentItemsets[firstIndex].items;
            const secondItemset = frequentItemsets[secondIndex].items;
            const candidateItems = Array.from(new Map(
                [...firstItemset, ...secondItemset]
                    .map(item => [item.toString(), item])
            ).values())
                .sort((firstItem, secondItem) => firstItem.toString().localeCompare(secondItem.toString()));

            if (candidateItems.length === itemsetSize) {
                candidates.set(getItemsetKey(candidateItems), candidateItems);
            }
        }
    }

    return Array.from(candidates.values());
}

function generateFrequentItemsets(transactions, minimumSupport = 0.5) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return [];
    }

    if (minimumSupport < 0 || minimumSupport > 1) {
        throw new Error('minimumSupport must be between 0 and 1');
    }

    const normalizedTransactions = transactions
        .map(transaction => Array.from(new Map(
            (transaction || [])
                .filter(Boolean)
                .map(item => [item.toString(), item])
        ).values()));

    const oneItemsets = new Map();
    for (const transaction of normalizedTransactions) {
        for (const item of transaction) {
            oneItemsets.set(item.toString(), item);
        }
    }

    let currentFrequentItemsets = Array.from(oneItemsets.values())
        .sort((firstItem, secondItem) => firstItem.toString().localeCompare(secondItem.toString()))
        .map(item => [item]);
    const frequentItemsets = [];

    while (currentFrequentItemsets.length > 0) {
        const supportedItemsets = currentFrequentItemsets
            .map(items => ({
                items,
                support: calculateSupport(items, normalizedTransactions)
            }))
            .filter(itemset => itemset.support >= minimumSupport);

        if (supportedItemsets.length === 0) {
            break;
        }

        frequentItemsets.push(...supportedItemsets);
        currentFrequentItemsets = generateCandidates(
            supportedItemsets,
            supportedItemsets[0].items.length + 1
        );
    }

    return frequentItemsets;
}

function validateRuleThresholds({ minimumSupport, minimumConfidence, minimumLift }) {
    if (minimumSupport < 0 || minimumSupport > 1) {
        throw new Error('minimumSupport must be between 0 and 1');
    }

    if (minimumConfidence < 0 || minimumConfidence > 1) {
        throw new Error('minimumConfidence must be between 0 and 1');
    }

    if (minimumLift < 0) {
        throw new Error('minimumLift must be greater than or equal to 0');
    }
}

function getNonEmptySubsets(items) {
    const subsets = [];
    const subsetCount = 2 ** items.length;

    for (let mask = 1; mask < subsetCount - 1; mask += 1) {
        const subset = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
            if (mask & (1 << itemIndex)) {
                subset.push(items[itemIndex]);
            }
        }

        subsets.push(subset);
    }

    return subsets;
}

function generateAssociationRules(
    frequentItemsets,
    {
        minimumSupport = 0,
        minimumConfidence = 0,
        minimumLift = 0
    } = {}
) {
    validateRuleThresholds({ minimumSupport, minimumConfidence, minimumLift });

    if (!Array.isArray(frequentItemsets) || frequentItemsets.length === 0) {
        return [];
    }

    const supportByItemset = new Map();
    const itemsByItemset = new Map();

    for (const itemset of frequentItemsets) {
        if (!itemset || !Array.isArray(itemset.items) || itemset.items.length === 0) {
            continue;
        }

        const items = Array.from(new Map(
            itemset.items
                .filter(Boolean)
                .map(item => [item.toString(), item])
        ).values())
            .sort((firstItem, secondItem) => firstItem.toString().localeCompare(secondItem.toString()));
        const key = getItemsetKey(items);

        if (items.length > 0 && Number.isFinite(itemset.support)) {
            supportByItemset.set(key, itemset.support);
            itemsByItemset.set(key, items);
        }
    }

    const rules = [];

    for (const [itemsetKey, items] of itemsByItemset) {
        const support = supportByItemset.get(itemsetKey);
        if (items.length < 2 || support < minimumSupport) {
            continue;
        }

        for (const antecedent of getNonEmptySubsets(items)) {
            const consequent = items.filter(item => !antecedent.some(
                antecedentItem => antecedentItem.toString() === item.toString()
            ));
            const antecedentSupport = supportByItemset.get(getItemsetKey(antecedent));
            const consequentSupport = supportByItemset.get(getItemsetKey(consequent));

            if (!antecedentSupport || !consequentSupport) {
                continue;
            }

            const confidence = support / antecedentSupport;
            const lift = confidence / consequentSupport;

            if (confidence < minimumConfidence || lift < minimumLift) {
                continue;
            }

            rules.push({
                antecedent,
                consequent,
                support,
                confidence,
                lift
            });
        }
    }

    return rules;
}

function generateRecommendations(inputMenuItems, associationRules) {
    if (!Array.isArray(inputMenuItems) || inputMenuItems.length === 0) {
        return [];
    }

    if (!Array.isArray(associationRules) || associationRules.length === 0) {
        return [];
    }

    const inputItemKeys = new Set(
        inputMenuItems.filter(Boolean).map(item => item.toString())
    );
    const rankedRules = associationRules
        .filter(rule => (
            rule &&
            Array.isArray(rule.antecedent) &&
            Array.isArray(rule.consequent) &&
            Number.isFinite(rule.confidence) &&
            Number.isFinite(rule.lift) &&
            Number.isFinite(rule.support)
        ))
        .filter(rule => rule.antecedent.every(item => (
            item && inputItemKeys.has(item.toString())
        )))
        .sort((firstRule, secondRule) => (
            secondRule.confidence - firstRule.confidence ||
            secondRule.lift - firstRule.lift ||
            secondRule.support - firstRule.support
        ));
    const recommendationsByItem = new Map();

    for (const rule of rankedRules) {
        for (const menuItem of rule.consequent) {
            if (!menuItem || inputItemKeys.has(menuItem.toString())) {
                continue;
            }

            const menuItemKey = menuItem.toString();
            if (!recommendationsByItem.has(menuItemKey)) {
                recommendationsByItem.set(menuItemKey, {
                    menuItem,
                    confidence: rule.confidence,
                    lift: rule.lift,
                    support: rule.support
                });
            }
        }
    }

    return Array.from(recommendationsByItem.values());
}

async function enhanceRecommendations(recommendations) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
        return [];
    }

    const menuItemIds = Array.from(new Map(
        recommendations
            .filter(recommendation => recommendation && recommendation.menuItem)
            .map(recommendation => [
                recommendation.menuItem.toString(),
                recommendation.menuItem
            ])
    ).values());

    if (menuItemIds.length === 0) {
        return [];
    }

    const [menuItems, inventoryItems, reviewSummaries] = await Promise.all([
        menuModel.find({ _id: { $in: menuItemIds } })
            .select('_id isAvailable')
            .lean(),
        inventoryModel.find({ menuItem: { $in: menuItemIds } })
            .select('menuItem quantity')
            .lean(),
        reviewModel.aggregate([
            { $match: { menuItem: { $in: menuItemIds } } },
            {
                $group: {
                    _id: '$menuItem',
                    averageRating: { $avg: '$rating' }
                }
            }
        ])
    ]);

    const availableMenuItems = new Set(
        (menuItems || [])
            .filter(menuItem => menuItem.isAvailable !== false)
            .map(menuItem => menuItem._id.toString())
    );
    const inStockMenuItems = new Set(
        (inventoryItems || [])
            .filter(inventoryItem => inventoryItem.quantity > 0)
            .map(inventoryItem => inventoryItem.menuItem.toString())
    );
    const averageRatings = new Map(
        (reviewSummaries || []).map(summary => [
            summary._id.toString(),
            Number.isFinite(summary.averageRating) ? summary.averageRating : 0
        ])
    );

    return recommendations
        .filter(recommendation => {
            if (!recommendation || !recommendation.menuItem) {
                return false;
            }

            const menuItemKey = recommendation.menuItem.toString();
            return availableMenuItems.has(menuItemKey) && inStockMenuItems.has(menuItemKey);
        })
        .map(recommendation => {
            const averageRating = averageRatings.get(recommendation.menuItem.toString()) || 0;
            const recommendationStrength = recommendation.confidence * recommendation.lift;

            return {
                menuItem: recommendation.menuItem,
                confidence: recommendation.confidence,
                lift: recommendation.lift,
                support: recommendation.support,
                averageRating,
                recommendationScore: recommendationStrength + (averageRating / 5)
            };
        })
        .sort((firstRecommendation, secondRecommendation) => (
            secondRecommendation.recommendationScore - firstRecommendation.recommendationScore ||
            secondRecommendation.confidence - firstRecommendation.confidence ||
            secondRecommendation.lift - firstRecommendation.lift ||
            secondRecommendation.averageRating - firstRecommendation.averageRating
        ));
}

function getSeason(date) {
    const month = date.getMonth();

    if (month >= 2 && month <= 4) {
        return 'spring';
    }

    if (month >= 5 && month <= 7) {
        return 'summer';
    }

    if (month >= 8 && month <= 10) {
        return 'autumn';
    }

    return 'winter';
}

function getTemporalMatchScore(purchaseDate, referenceDate) {
    const matches = [
        purchaseDate.getHours() === referenceDate.getHours(),
        purchaseDate.getDay() === referenceDate.getDay(),
        getSeason(purchaseDate) === getSeason(referenceDate)
    ];

    return matches.filter(Boolean).length / matches.length;
}

async function enhanceRecommendationsWithUserContext(
    recommendations,
    userId,
    {
        referenceDate = new Date(),
        rebuyWeight = 1,
        temporalWeight = 1
    } = {}
) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
        return [];
    }

    if (!userId) {
        return recommendations;
    }

    const completedOrders = await orderModel.find({
        user: userId,
        orderStatus: 'COMPLETED'
    })
        .select('items.menuItem createdAt')
        .lean();

    if (!Array.isArray(completedOrders) || completedOrders.length === 0) {
        return recommendations;
    }

    const itemHistory = new Map();

    for (const order of completedOrders) {
        const purchaseDate = new Date(order.createdAt);
        if (Number.isNaN(purchaseDate.getTime())) {
            continue;
        }

        const uniqueItems = new Map();
        for (const item of order.items || []) {
            if (item.menuItem) {
                uniqueItems.set(item.menuItem.toString(), item.menuItem);
            }
        }

        for (const [menuItemKey, menuItem] of uniqueItems) {
            if (!itemHistory.has(menuItemKey)) {
                itemHistory.set(menuItemKey, {
                    menuItem,
                    purchaseCount: 0,
                    temporalMatchTotal: 0
                });
            }

            const history = itemHistory.get(menuItemKey);
            history.purchaseCount += 1;
            history.temporalMatchTotal += getTemporalMatchScore(purchaseDate, referenceDate);
        }
    }

    const historyOrderCount = completedOrders.length;
    return recommendations
        .map(recommendation => {
            const menuItemKey = recommendation.menuItem.toString();
            const history = itemHistory.get(menuItemKey);
            const purchaseCount = history ? history.purchaseCount : 0;
            const rebuyScore = purchaseCount > 1
                ? purchaseCount / historyOrderCount
                : 0;
            const temporalScore = history
                ? history.temporalMatchTotal / purchaseCount
                : 0;
            const recommendationScore = Number.isFinite(recommendation.recommendationScore)
                ? recommendation.recommendationScore
                : 0;
            const contextScore = (
                rebuyScore * rebuyWeight +
                temporalScore * temporalWeight
            );

            return {
                ...recommendation,
                rebuyScore,
                temporalScore,
                combinedRecommendationScore: recommendationScore + contextScore
            };
        })
        .sort((firstRecommendation, secondRecommendation) => (
            secondRecommendation.combinedRecommendationScore -
                firstRecommendation.combinedRecommendationScore ||
            secondRecommendation.rebuyScore - firstRecommendation.rebuyScore ||
            secondRecommendation.temporalScore - firstRecommendation.temporalScore
        ));
}

async function generateFrequentItemsetsFromCompletedOrders(minimumSupport = 0.5) {
    const transactions = await extractCompletedTransactions();
    return generateFrequentItemsets(transactions, minimumSupport);
}

module.exports = {
    extractCompletedTransactions,
    calculateSupport,
    generateFrequentItemsets,
    generateFrequentItemsetsFromCompletedOrders,
    generateAssociationRules,
    generateRecommendations,
    enhanceRecommendations,
    enhanceRecommendationsWithUserContext
};
