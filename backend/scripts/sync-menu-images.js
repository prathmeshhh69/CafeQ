require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Menu = require("../src/models/menu.model");
const { loadMenuImages } = require("./menu-images");

async function syncMenuImages() {
  const images = loadMenuImages();
  await connectDB();
  if (mongoose.connection.readyState !== 1) throw new Error("MongoDB connection failed. Check MONGO_URI.");

  const matched = [];
  const unmatched = [];
  for (const [name, image] of images) {
    const result = await Menu.updateMany({ name }, { $set: { image } });
    (result.matchedCount ? matched : unmatched).push(name);
  }

  console.log(`Updated images for ${matched.length} menu names: ${matched.join(", ") || "none"}.`);
  if (unmatched.length) console.log(`No menu item found for: ${unmatched.join(", ")}.`);
}

syncMenuImages().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
