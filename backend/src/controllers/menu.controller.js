const menuModel=require('../models/menu.model')

async function createmenuItem(req,res){
    try {
        const {name, description, price, category, image, isAvailable} = req.body;
        const menuItem = await menuModel.create({
            name,
            description,
            price,
            category,
            image,
            isAvailable
        });
        res.status(201).json({
            message: 'Menu item created successfully',
            menuItem
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getMenuItems(req,res){
    try {
        const {category,search,available,page=1,limit=5}=req.query
        const filter={};
        if(category){
            filter.category=category
        }
        if(available !== undefined){
            filter.isAvailable=available === 'true'
        }
        const skip=(page-1)*limit
        if (search) {
    filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
    ];
}
const total = await menuModel.countDocuments(filter);

const totalPages = Math.ceil(total / limit);

const menuItems = await menuModel
    .find(filter)
    .skip(skip)
    .limit(Number(limit));
        res.status(200).json({
            message: 'Menu items retrieved successfully',
            menuItems,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updateMenuItem(req,res){
    try {
        const {id} = req.params;
        const {name, description, price, category, image, isAvailable} = req.body;
        const menuItem = await menuModel.findByIdAndUpdate(id, {
            name,
            description,
            price,
            category,
            image,
            isAvailable
        }, { new: true });  
        res.status(200).json({
            message: 'Menu item updated successfully',
            menuItem
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteMenuItem(req,res){
    const {id}=req.params
    const menuItem=await menuModel.findByIdAndDelete(id)
    if(!menuItem){
        return res.status(404).json({
            message:'Menu item not found'
        })
    }
    res.status(200).json({
        message: 'Menu item deleted successfully'
    });
}

module.exports={createmenuItem,getMenuItems,updateMenuItem,deleteMenuItem}