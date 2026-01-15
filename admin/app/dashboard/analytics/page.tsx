"use client";

import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("week");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600 text-sm mt-1">Platform performance and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <p className="text-gray-600 text-sm">Weekly Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹0</p>
            <p className="text-xs text-gray-500 mt-1">No data yet</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-gray-600 text-sm">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-1">No bookings yet</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-gray-600 text-sm">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0⭐</p>
            <p className="text-xs text-gray-500 mt-1">No reviews yet</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-gray-600 text-sm">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
            <p className="text-xs text-gray-500 mt-1">No data yet</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="card">
        <div className="card-body">
          <div className="py-16 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-600 mb-6">Analytics will appear once you have bookings and transactions</p>
            <div className="text-sm text-gray-500">
              <p>• Register electricians</p>
              <p>• Create bookings</p>
              <p>• Complete transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
