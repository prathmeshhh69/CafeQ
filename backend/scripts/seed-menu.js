require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Menu = require("../src/models/menu.model");
const Inventory = require("../src/models/inventory.model");
const Cart = require("../src/models/cart.model");
const Review = require("../src/models/review.model");

const menu = [
  ["Shawarma - Non-Veg", "Regular chicken Shawarma", 100],
  ["Shawarma - Non-Veg", "Schezwan chicken Shawarma", 110],
  ["Shawarma - Non-Veg", "Schezwan chicken cheese shawarma", 140],
  ["Shawarma - Non-Veg", "Cheese chicken Shawarma", 130],
  ["Shawarma - Non-Veg", "Special chicken Shawarma", 150, "Extra chicken loaded and without veggies"],
  ["Shawarma - Non-Veg", "Special chicken cheese shawarma", 180],
  ["Shawarma - Non-Veg", "Salad chicken bowl", 170, "Open chicken shawarma without bread"],
  ["Shawarma - Non-Veg", "Salad chicken cheese bowl", 200],
  ["Shawarma - Non-Veg", "Special Salad", 200, "Extra chicken loaded and without veggies"],
  ["Shawarma - Non-Veg", "Special Salad Cheese bowl", 230],
  ["Shawarma - Non-Veg", "Shawarma Plate", 190, "Open chicken shawarma with bread"],
  ["Shawarma - Non-Veg", "Shawarma plate cheese", 220],
  ["Shawarma - Non-Veg", "Special Shawarma open Plate", 230, "Extra chicken loaded and no veggies"],
  ["Shawarma - Non-Veg", "Special Shawarma open Plate Cheese", 260],
  ["Shawarma - Non-Veg", "Extra Mayo", 20],
  ["Shawarma - Non-Veg", "Extra Pita", 20],
  ["Shawarma - Veg", "Paneer Shawarma", 100],
  ["Shawarma - Veg", "Paneer Shezwan Shawarma", 110],
  ["Shawarma - Veg", "Paneer Cheese Shawarma", 130],
  ["Shawarma - Veg", "Falafel Roll", 90],
  ["Shawarma - Veg", "Falafel cheese", 110],
  ["Lassi", "Sweet Lassi", 60], ["Lassi", "Mango Lassi", 70], ["Lassi", "Banana Lassi", 70],
  ["Lassi", "Pineapple Lassi", 70], ["Lassi", "Chocolate Lassi", 70], ["Lassi", "Dryfruit Lassi", 80],
  ["Lassi", "Strawberry Lassi", 80], ["Lassi", "Gulkand Lassi", 80], ["Lassi", "Arabian Lassi", 80],
  ["Lassi", "Ice cream Lassi", 80], ["Lassi", "Mix Fruit Lassi", 100], ["Lassi", "Lassi Wassi Secret", 140],
  ["Juice", "Watermelon", 70], ["Juice", "Pineapple", 70], ["Juice", "Orange", 70], ["Juice", "Mosambi", 70],
  ["Coffee", "Cold Coffee", 60], ["Coffee", "Chocolate Coffee", 80], ["Coffee", "Creamy Coffee", 80],
  ["Coffee", "Coffee On The Rocks", 80], ["Coffee", "Peanut Butter Coffee", 120],
  ["Coffee", "Choco Brownie Coffee", 120], ["Coffee", "Mud Coffee", 140],
  ["Lemonades", "Fresh Lime Water", 40], ["Lemonades", "Ginger Lime", 50], ["Lemonades", "Mint Lime", 50],
  ["Lemonades", "Lime Soda", 50], ["Lemonades", "Masala Lime Soda", 50],
  ["Mojito", "Blue island mojito", 70], ["Mojito", "Virgin Mojito", 70], ["Mojito", "Green Apple Mojito", 70],
  ["Mojito", "Mouth Busting Chill", 70], ["Mojito", "Red Blast", 70], ["Mojito", "Brain Fresher", 70],
  ["Mojito", "Black Current", 70], ["Mojito", "Bluberry Mojito", 70], ["Mojito", "Cranberry", 70],
  ["Mojito", "Passionfruit", 100],
  ["Ice Cream", "Death By Chocolate", 120], ["Ice Cream", "Chocolate Dream", 120],
  ["Ice Cream", "Brownie With Ice Cream", 100], ["Ice Cream", "Fruit Salad With Ice Cream", 100],
  ["Summer Slam", "Mind Cooler", 80], ["Summer Slam", "Body Cooler", 80],
  ["Modern Twist", "Mud Chocolate", 140], ["Modern Twist", "Smooth Criminal", 130],
  ["Ice Tea", "Lemon Ice Tea", 40], ["Ice Tea", "Peach Ice Tea", 40],
  ["International", "Nutella Hazelnut", 120], ["International", "Peanut Butter", 120],
  ["International", "Kitkat", 120], ["International", "Chocolate Brownie", 120],
  ["Thick Shake", "Oreo Licious", 80], ["Thick Shake", "Belgium Chocolate", 80],
  ["Thick Shake", "Fantastic Strawberry", 80], ["Thick Shake", "Alphanso Mango", 80],
  ["Thick Shake", "Ferrer Rocher", 140], ["Thick Shake", "Choco Banana", 80],
  ["Thick Shake", "French Vanilla", 80], ["Thick Shake", "Sharjah Shake", 80],
  ["Thick Shake", "Sexy Lichi", 80], ["Thick Shake", "Dryfruit Shake", 120],
];

const reset = process.argv.includes("--reset");

async function seed() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) throw new Error("MongoDB connection failed. Check MONGO_URI.");

  const seeded = [];
  for (const [category, name, price, description = ""] of menu) {
    const item = await Menu.findOneAndUpdate(
      { category, name },
      { $set: { category, name, price, description, image: "", isAvailable: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    seeded.push(item);
    await Inventory.findOneAndUpdate(
      { menuItem: item._id },
      { $setOnInsert: { menuItem: item._id, quantity: 100, minimumStock: 10 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  if (reset) {
    const keepIds = seeded.map((item) => item._id);
    const stale = await Menu.find({ _id: { $nin: keepIds } }).select("_id");
    const staleIds = stale.map((item) => item._id);
    if (staleIds.length) {
      await Promise.all([
        Inventory.deleteMany({ menuItem: { $in: staleIds } }),
        Review.deleteMany({ menuItem: { $in: staleIds } }),
        Cart.updateMany({}, { $pull: { items: { menuItem: { $in: staleIds } } } }),
        Menu.deleteMany({ _id: { $in: staleIds } }),
      ]);
    }
    console.log(`Seeded ${seeded.length} menu items and removed ${staleIds.length} stale menu items.`);
  } else {
    console.log(`Seeded ${seeded.length} menu items. Run with --reset to remove menu items not in this catalogue.`);
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
