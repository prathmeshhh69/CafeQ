require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/user.model");
const { generateUniqueCode } = require("../src/utils/code.util");

async function backfillCustomerCodes() {
  await connectDB();

  const users = await User.find({
    role: "CUSTOMER",
    $or: [
      { customerCode: { $exists: false } },
      { customerCode: null },
      { customerCode: "" }
    ]
  }).select("_id");

  let updatedCount = 0;

  for (const user of users) {
    let result;

    do {
      const customerCode = await generateUniqueCode(
        User,
        "customerCode",
        code => `CFA-${code}`
      );

      try {
        result = await User.updateOne(
          {
            _id: user._id,
            role: "CUSTOMER",
            $or: [
              { customerCode: { $exists: false } },
              { customerCode: null },
              { customerCode: "" }
            ]
          },
          { $set: { customerCode } }
        );
      } catch (error) {
        // Retry if another writer claimed this random code after the existence check.
        if (error.code === 11000) {
          result = null;
        } else {
          throw error;
        }
      }
    } while (result === null);

    updatedCount += result.modifiedCount;
  }

  console.log(`Backfilled customerCode for ${updatedCount} users.`);
}

backfillCustomerCodes()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
