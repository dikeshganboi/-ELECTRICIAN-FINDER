const mongoose = require("mongoose");

async function clearDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/electrician-finder");

    const db = mongoose.connection.db;

    console.log("\n🗑️  CLEARING DATABASE\n");
    console.log("=".repeat(60));

    // Delete all users
    const usersResult = await db.collection("users").deleteMany({});
    console.log(`✅ Deleted ${usersResult.deletedCount} users`);

    // Delete all electricians
    const electriciansResult = await db.collection("electricians").deleteMany({});
    console.log(`✅ Deleted ${electriciansResult.deletedCount} electricians`);

    // Also clear other related collections if they exist
    const bookingsResult = await db.collection("bookings").deleteMany({});
    console.log(`✅ Deleted ${bookingsResult.deletedCount} bookings`);

    const reviewsResult = await db.collection("reviews").deleteMany({});
    console.log(`✅ Deleted ${reviewsResult.deletedCount} reviews`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Database cleared successfully!");
    console.log("\n💡 You can now start fresh:");
    console.log("   1. Register new electrician at http://localhost:3000");
    console.log("   2. Submit verification documents");
    console.log("   3. Review in admin panel at http://localhost:3001");
    console.log("\n");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

clearDatabase();
