const mongoose = require("mongoose");

// Connect and check the database state
async function diagnose() {
  try {
    await mongoose.connect("mongodb://localhost:27017/electrician-finder", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;

    console.log("\n📊 DIAGNOSTICS REPORT\n");
    console.log("=".repeat(60));

    // 1. Check Users
    const users = await db.collection("users").find({}).toArray();
    console.log(`\n1️⃣ USERS (${users.length} found):`);
    users.forEach((user) => {
      console.log(
        `   - ${user.name} (${user.email}) [Role: ${user.role}] [ID: ${user._id}]`
      );
    });

    // 2. Check Electricians
    const electricians = await db.collection("electricians").find({}).toArray();
    console.log(`\n2️⃣ ELECTRICIANS (${electricians.length} found):`);
    electricians.forEach((elec) => {
      console.log(
        `   - ID: ${elec._id}`
      );
      console.log(
        `     User ID: ${elec.userId}`
      );
      console.log(
        `     Status: ${elec.verificationStatus || "NOT SET"}`
      );
      console.log(
        `     Submissions: ${(elec.verificationSubmissions || []).length}`
      );
      if ((elec.verificationSubmissions || []).length > 0) {
        elec.verificationSubmissions.forEach((sub, idx) => {
          console.log(
            `       ├─ Submission ${idx + 1}: ${sub.status} (${sub.submittedAt})`
          );
          console.log(
            `       │  Documents: ${sub.documents.map((d) => d.type).join(", ")}`
          );
        });
      }
    });

    // 3. Check Pending Verifications
    console.log(
      `\n3️⃣ PENDING VERIFICATIONS (query: verificationStatus = "pending"):`
    );
    const pending = await db
      .collection("electricians")
      .find({ verificationStatus: "pending" })
      .toArray();
    console.log(`   Found: ${pending.length}`);
    pending.forEach((p) => {
      console.log(
        `   - Electrician ${p._id} (User: ${p.userId}) - ${(p.verificationSubmissions || []).length} submissions`
      );
    });

    // 4. Data Consistency Check
    console.log(`\n4️⃣ DATA CONSISTENCY CHECK:`);
    for (const elec of electricians) {
      if (!elec.userId) {
        console.log(`   ⚠️  Electrician ${elec._id} has NO userId!`);
      } else {
        const user = users.find((u) => u._id.toString() === elec.userId.toString());
        if (!user) {
          console.log(
            `   ⚠️  Electrician ${elec._id} references non-existent user ${elec.userId}`
          );
        } else {
          console.log(
            `   ✅ Electrician ${elec._id} correctly links to user ${user.email}`
          );
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n💡 RECOMMENDATIONS:");
    if (electricians.length === 0) {
      console.log("   ❌ No electricians in database - need to register one first");
    }
    if (pending.length === 0) {
      console.log(
        "   ❌ No pending verifications - check if submission was actually saved"
      );
    } else {
      console.log(`   ✅ Found ${pending.length} pending verification(s)`);
      console.log(`   ➡️  Admin panel should show these on verification page`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

diagnose();
