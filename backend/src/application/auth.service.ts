import bcrypt from "bcrypt";
import { UserModel } from "../infra/db/models/user.model";
import { ElectricianModel } from "../infra/db/models/electrician.model";
import { signAccess, signRefresh } from "../utils/jwt";
import { Role } from "../domain/models/user";

export const register = async ({ name, email, phone, password, role }: { name: string; email: string; phone: string; password: string; role: Role; }) => {
  const existing = await UserModel.findOne({ $or: [{ email }, { phone }] });
  if (existing) throw new Error("User already exists");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, phone, passwordHash, role });
  
  // Create Electrician record if registering as electrician
  if (role === "electrician") {
    await ElectricianModel.create({
      userId: user._id,
      skills: [],
      availabilityStatus: "offline",
      isVerified: false,
      verificationStatus: "not_submitted",
      canGoOnline: false,
      // Default location (user's current location will be updated when they go online)
      currentLocation: {
        type: "Point",
        coordinates: [0, 0] // Placeholder; real location set when online
      }
    });
  }
  
  const payload = { userId: user._id.toString(), role: user.role as Role };
  return { accessToken: signAccess(payload), refreshToken: signRefresh(payload), user };
};

export const login = async ({ email, password }: { email: string; password: string; }) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");
  const payload = { userId: user._id.toString(), role: user.role as Role };
  return { accessToken: signAccess(payload), refreshToken: signRefresh(payload), user };
};
