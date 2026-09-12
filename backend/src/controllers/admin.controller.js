const Order = require('../models/order.model');
const Inventory = require('../models/inventory.model');

async function getDashboardData(req, res) {
    try {
        const { from, to } = req.query;
        let dateFilter = {};

        if (from && to) {
            if (new Date(from) > new Date(to)) {
                return res.status(400).json({ message: "from date cannot be after to date" });
            }
        }

        if (from || to) {
            dateFilter.createdAt = {};
            if (from) {
                const fromDate = new Date(from);
                if (!isNaN(fromDate.getTime())) {
                    dateFilter.createdAt.$gte = fromDate;
                } else {
                    return res.status(400).json({ message: "Invalid 'from' date format." });
                }
            }
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                if (!isNaN(toDate.getTime())) {
                    dateFilter.createdAt.$lte = toDate;
                } else {
                    return res.status(400).json({ message: "Invalid 'to' date format." });
                }
            }
        }

        const matchStage = { $match: dateFilter };

        const orderAggregations = await Order.aggregate([
            matchStage,
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                pendingOrders: {
                                    $sum: { $cond: [{ $eq: ["$orderStatus", "PENDING"] }, 1, 0] }
                                },
                                completedOrders: {
                                    $sum: { $cond: [{ $eq: ["$orderStatus", "COMPLETED"] }, 1, 0] }
                                },
                                cancelledOrders: {
                                    $sum: { $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 1, 0] }
                                },
                                paidOrders: {
                                    $sum: { $cond: [{ $eq: ["$paymentStatus", "PAID"] }, 1, 0] }
                                },
                                totalRevenue: {
                                    $sum: {
                                        $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$totalAmount", 0]
                                    }
                                }
                            }
                        }
                    ],
                    ordersByStatus: [
                        {
                            $group: {
                                _id: "$orderStatus",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                status: "$_id",
                                count: 1
                            }
                        }
                    ],
                    revenueByDate: [
                        { $match: { paymentStatus: "PAID" } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                totalRevenue: { $sum: "$totalAmount" }
                            }
                        },
                        { $sort: { _id: 1 } },
                        {
                            $project: {
                                _id: 0,
                                date: "$_id",
                                totalRevenue: 1
                            }
                        }
                    ],
                    topMenuItems: [
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: "$items.name",
                                quantity: { $sum: "$items.quantity" }
                            }
                        },
                        { $sort: { quantity: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                quantity: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const aggResult = orderAggregations[0];
        const summaryObj = aggResult.summary[0] || {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            paidOrders: 0,
            totalRevenue: 0
        };

        const inventoryTotal = await Inventory.countDocuments();
        const inventoryLowStock = await Inventory.countDocuments({ $expr: { $lte: ["$quantity", "$minimumStock"] } });
        const inventoryOutOfStock = await Inventory.countDocuments({ quantity: 0 });

        return res.status(200).json({
            summary: {
                totalOrders: summaryObj.totalOrders || 0,
                pendingOrders: summaryObj.pendingOrders || 0,
                completedOrders: summaryObj.completedOrders || 0,
                cancelledOrders: summaryObj.cancelledOrders || 0,
                paidOrders: summaryObj.paidOrders || 0,
                totalRevenue: summaryObj.totalRevenue || 0
            },
            inventory: {
                totalItems: inventoryTotal,
                lowStockItems: inventoryLowStock,
                outOfStockItems: inventoryOutOfStock
            },
            topMenuItems: aggResult.topMenuItems || [],
            ordersByStatus: aggResult.ordersByStatus || [],
            revenueByDate: aggResult.revenueByDate || []
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { getDashboardData };
