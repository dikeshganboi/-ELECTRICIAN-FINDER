"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setTokens } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.login({ email, password });
      setTokens(result.accessToken, result.refreshToken);
      
      // Redirect based on role
      const role = result.user?.role;
      const destination = role === "electrician" 
        ? "/dashboard/electrician" 
        : "/dashboard/user";
      
      // Use hard navigation to avoid any client-side state issues
      if (typeof window !== "undefined") {
        window.location.href = destination;
      } else {
        router.push(destination);
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
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
            <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
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
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center p-12">
        <div className="text-white text-center space-y-6">
          <Zap className="h-24 w-24 mx-auto" />
          <h2 className="text-4xl font-bold">Find Trusted Electricians</h2>
          <p className="text-xl opacity-90">Book verified professionals in seconds</p>
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-white opacity-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
