const fetch = require("node-fetch");

async function testAdminFlow() {
  console.log("🔍 TESTING ADMIN VERIFICATION ENDPOINT\n");
  console.log("=".repeat(60));

  try {
    // Step 1: Login as admin
    console.log("\n1️⃣ ADMIN LOGIN");
    const loginRes = await fetch("http://localhost:4000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@electricianfinder.com",
        password: "admin@123",
      }),
    });

    if (!loginRes.ok) {
      console.error(`❌ Login failed: ${loginRes.status}`);
      const text = await loginRes.text();
      console.error(text);
      return;
    }

    const loginData = await loginRes.json();
    const adminToken = loginData.token;
    console.log(`✅ Admin logged in successfully`);
    console.log(`   Token: ${adminToken.substring(0, 20)}...`);
    console.log(`   Admin: ${loginData.admin.email}`);

    // Step 2: Fetch pending electricians
    console.log("\n2️⃣ FETCH PENDING ELECTRICIANS");
    const electricianRes = await fetch(
      "http://localhost:4000/api/admin/electricians?status=pending",
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    console.log(`   Response Status: ${electricianRes.status}`);

    if (!electricianRes.ok) {
      console.error(`❌ Fetch failed`);
      const text = await electricianRes.text();
      console.error(text);
      return;
    }

    const electricians = await electricianRes.json();
    console.log(`✅ Fetched ${electricians.length} pending electrician(s)`);

    if (Array.isArray(electricians)) {
      electricians.forEach((e, idx) => {
        console.log(`\n   Electrician ${idx + 1}:`);
        console.log(`   - Name: ${e.name}`);
        console.log(`   - Email: ${e.email}`);
        console.log(`   - Status: ${e.verificationStatus}`);
        console.log(`   - Submissions: ${e.verificationSubmissions?.length || 0}`);
      });
    } else {
      console.log("   Response is not an array:");
      console.log(JSON.stringify(electricians, null, 2));
    }

    console.log("\n" + "=".repeat(60));
    if (electricians.length > 0) {
      console.log("✅ SUCCESS - Admin endpoint is working correctly!");
      console.log("   Issue is likely in admin frontend!");
    } else {
      console.log("❌ PROBLEM - Endpoint returned empty array");
      console.log("   Check database query in backend");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAdminFlow();
