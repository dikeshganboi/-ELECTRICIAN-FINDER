import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../../infra/db/models/user.model";
import { ElectricianModel } from "../../infra/db/models/electrician.model";

const router = Router();

// ⚠️ ONLY FOR DEVELOPMENT - Setup test data
router.post("/seed-electricians", async (req, res, next) => {
  try {
    // Create sample electricians with locations
    const sampleElectricians = [
      {
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9876543210",
        skills: ["AC Repair", "Wiring"],
        lat: 18.5401344,
        lng: 73.8557952,
        baseRate: 500
      },
      {
        name: "Amit Singh",
        email: "amit@example.com",
        phone: "9876543211",
        skills: ["Plumbing", "Heating"],
        lat: 18.5420,
        lng: 73.8550,
        baseRate: 450
      },
      {
        name: "Priya Patel",
        email: "priya@example.com",
        phone: "9876543212",
        skills: ["Electrical", "Solar"],
        lat: 18.5390,
        lng: 73.8570,
        baseRate: 600
      },
      {
        name: "Vikram Verma",
        email: "vikram@example.com",
        phone: "9876543213",
        skills: ["AC Repair", "Maintenance"],
        lat: 18.5410,
        lng: 73.8530,
        baseRate: 480
      }
    ];

    const created = [];
    for (const elec of sampleElectricians) {
      // Check if user exists
      let user = await UserModel.findOne({ email: elec.email });
      
      if (!user) {
        // Create user
        const passwordHash = await bcrypt.hash("password123", 10);
        user = await UserModel.create({
          name: elec.name,
          email: elec.email,
          phone: elec.phone,
          passwordHash,
          role: "electrician"
        });
      }

      // Update or create electrician with location
      const electrician = await ElectricianModel.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          skills: elec.skills,
          availabilityStatus: "online", // Make them online
          isVerified: true, // Pre-verified for demo
          baseRate: elec.baseRate,
          currentLocation: {
            type: "Point",
            coordinates: [elec.lng, elec.lat]
          }
        },
        { upsert: true, new: true }
      );

      created.push({ 
        name: elec.name, 
        status: "active", 
        email: elec.email,
        location: { lat: elec.lat, lng: elec.lng },
        online: true
      });
    }

    res.json({
      message: "Sample electricians seeded and activated",
      electricians: created,
      testCredentials: {
        email: "rajesh@example.com",
        password: "password123"
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

