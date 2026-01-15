"use client";

import { Save, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAdmin } from "@/lib/context/AdminContext";

export default function SettingsPage() {
  const { admin } = useAdmin();
  const [formData, setFormData] = useState({
    commission: 15,
    minimumBookingAmount: 100,
    maxCancellationTime: 5,
    autoApproveElectricians: false,
    maintenanceMode: false,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 text-sm mt-1">Configure platform parameters and policies</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Commission Settings */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission & Pricing</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Platform takes {formData.commission}% from each booking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Booking Amount (₹)
                </label>
                <input
                  type="number"
                  name="minimumBookingAmount"
                  value={formData.minimumBookingAmount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Policies</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Cancellation Time (minutes)
              </label>
              <input
                type="number"
                name="maxCancellationTime"
                value={formData.maxCancellationTime}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Bookings can be cancelled within this time for free
              </p>
            </div>
          </div>
        </div>

        {/* Verification Settings */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Settings</h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Auto-approve Electricians</p>
                <p className="text-sm text-gray-600">Automatically approve electricians after document verification</p>
              </div>
              <input
                type="checkbox"
                name="autoApproveElectricians"
                checked={formData.autoApproveElectricians}
                onChange={handleChange}
                className="w-6 h-6 text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Status</h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-600">Disable bookings and hide platform from users</p>
              </div>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="w-6 h-6 text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}

        <button
          type="submit"
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </form>
    </div>
  );
}
