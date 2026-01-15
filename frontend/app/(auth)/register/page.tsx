"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Mail, Lock, User, Phone, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "electrician">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setTokens } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.register({ name, email, phone, password, role });
      setTokens(result.accessToken, result.refreshToken);
      router.push("/dashboard");
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-8">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">ElectricianFinder</span>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-600">Join thousands of satisfied customers today</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`p-4 border-2 rounded-lg transition ${
                role === "user"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <User className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">I need help</div>
              <div className="text-xs text-gray-500">Find electricians</div>
            </button>
            <button
              type="button"
              onClick={() => setRole("electrician")}
              className={`p-4 border-2 rounded-lg transition ${
                role === "electrician"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Zap className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">I'm a pro</div>
              <div className="text-xs text-gray-500">Offer services</div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-blue-600 items-center justify-center p-12">
        <div className="text-white space-y-8 max-w-lg">
          <Shield className="h-24 w-24" />
          <h2 className="text-4xl font-bold">Trusted by Thousands</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold mb-1">Verified Professionals</div>
                <div className="text-white/80">All electricians are background-checked</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold mb-1">Instant Booking</div>
                <div className="text-white/80">Get help in minutes, not hours</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
              <div>
                <div className="font-semibold mb-1">Secure Payments</div>
                <div className="text-white/80">Safe and encrypted transactions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
