const { getFoodRecommendations } = require('../services/ai.service');
const menuModel = require('../models/menu.model');

function isItemVegetarian(item) {
    const category = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();

    if (category.includes('non-veg') || name.includes('chicken') || name.includes('meat') || name.includes('fish') || name.includes('egg')) {
        return false;
    }

    if (category.includes('veg') || name.includes('paneer') || name.includes('falafel')) {
        return true;
    }

    const beverageCategories = [
        'lassi',
        'juice',
        'coffee',
        'lemonades',
        'mojito',
        'ice cream',
        'summer slam',
        'modern twist',
        'ice tea',
        'international',
        'thick shake'
    ];

    if (beverageCategories.some(cat => category.includes(cat))) {
        return true;
    }

    return null;
}

async function foodAssistant(req, res) {
    try {
        const { message } = req.body || {};

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                message: 'A valid non-empty message is required.'
            });
        }

        const menuItems = await menuModel.find({ isAvailable: true }).lean();

        const availableMenuItems = menuItems.map(item => ({
            menuItemId: item._id.toString(),
            name: item.name,
            category: item.category,
            price: item.price,
            availability: item.isAvailable
        }));

        const result = await getFoodRecommendations({
            customerMessage: message.trim(),
            availableMenuItems,
            aprioriRecommendations: []
        });

        const availableMenuMap = new Map(
            availableMenuItems.map(item => [item.menuItemId, item])
        );

        const constraints = result?.constraints || {};
        const maxPrice = typeof constraints.maxPrice === 'number' && !isNaN(constraints.maxPrice)
            ? constraints.maxPrice
            : null;
        const diet = typeof constraints.diet === 'string'
            ? constraints.diet.trim().toLowerCase()
            : null;
        const categoryConstraint = typeof constraints.category === 'string' && constraints.category.trim() !== ''
            ? constraints.category.trim().toLowerCase()
            : null;

        const rawRecommendations = Array.isArray(result?.recommendations)
            ? result.recommendations
            : [];

        const filteredRecommendations = rawRecommendations
            .filter(rec => rec && rec.menuItemId && availableMenuMap.has(rec.menuItemId.toString()))
            .filter(rec => {
                const menuItem = availableMenuMap.get(rec.menuItemId.toString());

                if (maxPrice !== null && typeof menuItem.price === 'number') {
                    if (menuItem.price > maxPrice) {
                        return false;
                    }
                }

                if (diet === 'vegetarian') {
                    const vegStatus = isItemVegetarian(menuItem);
                    if (vegStatus === false) {
                        return false;
                    }
                } else if (diet === 'non-vegetarian') {
                    const vegStatus = isItemVegetarian(menuItem);
                    if (vegStatus === true) {
                        return false;
                    }
                }

                if (categoryConstraint) {
                    const itemCat = (menuItem.category || '').toLowerCase();
                    if (!itemCat.includes(categoryConstraint) && !categoryConstraint.includes(itemCat)) {
                        return false;
                    }
                }

                return true;
            })
            .map(rec => {
                const menuItem = availableMenuMap.get(rec.menuItemId.toString());
                return {
                    menuItemId: menuItem.menuItemId,
                    name: menuItem.name,
                    category: menuItem.category,
                    price: menuItem.price,
                    availability: menuItem.availability,
                    reason: rec.reason || ''
                };
            });

        if (filteredRecommendations.length === 0) {
            return res.status(200).json({
                message: "I couldn't find an available item matching all of those requirements.",
                recommendations: []
            });
        }

        return res.status(200).json({
            message: result?.message || '',
            recommendations: filteredRecommendations
        });
    } catch (error) {
        console.error('Error in foodAssistant controller:', error);
        return res.status(500).json({
            message: error.message || 'Failed to process AI food recommendation.'
        });
    }
}

module.exports = {
    foodAssistant
};
