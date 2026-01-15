"use client";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, TrendingUp, Clock, Star, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <span className="text-base sm:text-xl font-bold">ElectricianFinder</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/search">
              <Button size="sm" className="text-xs sm:text-sm">Find Electrician</Button>
            </Link>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your bookings today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-xs sm:text-sm font-semibold">+12%</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">24</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Total Bookings</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+8%</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">₹12,450</h3>
            <p className="text-gray-600 text-sm">Total Spent</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+5</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">8</h3>
            <p className="text-gray-600 text-sm">Saved Pros</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-gray-600 text-sm font-semibold">Avg</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">4.8</h3>
            <p className="text-gray-600 text-sm">Your Rating</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Recent Bookings</h2>
            </div>
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">AC Installation</h3>
                          <p className="text-sm text-gray-600">by Rajesh Kumar</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Dec 20, 2025
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          2:00 PM
                        </span>
                        <span className="font-semibold text-gray-900">₹499</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <Button variant="ghost" className="w-full">View All Bookings</Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-sm opacity-90 mb-4">Find electricians near you instantly</p>
              <Link href="/search">
                <Button variant="secondary" className="w-full">
                  Book Now
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="font-semibold">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
