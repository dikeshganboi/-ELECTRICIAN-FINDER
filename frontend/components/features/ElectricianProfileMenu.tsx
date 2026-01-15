"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, Settings, Camera, Mail, Phone, MapPin, Briefcase, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ElectricianProfileMenuProps {
  electricianData: {
    name: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experienceYears?: number;
    baseRate?: number;
    verificationStatus?: string;
    profilePhoto?: string;
  } | null;
  onPhotoUpload?: (file: File) => Promise<void>;
}

export function ElectricianProfileMenu({ electricianData, onPhotoUpload }: ElectricianProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPhotoUpload) {
      setIsUploading(true);
      try {
        await onPhotoUpload(file);
      } catch (error) {
        console.error("Failed to upload photo:", error);
        alert("Failed to upload photo. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getVerificationBadgeColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition"
      >
        <div className="relative">
          {electricianData?.profilePhoto ? (
            <img
              src={electricianData.profilePhoto}
              alt={electricianData.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-blue-500">
              {electricianData ? getInitials(electricianData.name) : "E"}
            </div>
          )}
          {electricianData?.verificationStatus === "approved" && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
              <Award className="w-2.5 h-2.5 text-white m-auto mt-0.5" />
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
            {electricianData?.name || "Electrician"}
          </p>
          <p className="text-xs text-gray-500">Service Provider</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative">
                {electricianData?.profilePhoto ? (
                  <img
                    src={electricianData.profilePhoto}
                    alt={electricianData.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl border-4 border-white shadow-lg">
                    {electricianData ? getInitials(electricianData.name) : "E"}
                  </div>
                )}
                <button
                  onClick={handlePhotoClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-white min-w-0">
                <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">
                  {electricianData?.name || "Electrician"}
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mb-2">Professional Electrician</p>
                {electricianData?.verificationStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getVerificationBadgeColor(
                      electricianData.verificationStatus
                    )}`}
                  >
                    <Award className="w-3 h-3" />
                    {electricianData.verificationStatus === "approved"
                      ? "Verified"
                      : electricianData.verificationStatus.charAt(0).toUpperCase() +
                        electricianData.verificationStatus.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 sm:p-5 space-y-3 max-h-[400px] overflow-y-auto">
            {/* Contact Information */}
            {electricianData?.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 truncate">{electricianData.email}</p>
                </div>
              </div>
            )}

            {electricianData?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{electricianData.phone}</p>
                </div>
              </div>
            )}

            {/* Professional Information */}
            {electricianData?.experienceYears !== undefined && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {electricianData.experienceYears} {electricianData.experienceYears === 1 ? "year" : "years"}
                  </p>
                </div>
              </div>
            )}

            {electricianData?.baseRate && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Base Rate</p>
                  <p className="text-sm text-gray-900 font-semibold">₹{electricianData.baseRate}/hour</p>
                </div>
              </div>
            )}

            {/* Skills */}
            {electricianData?.skills && electricianData.skills.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-2 font-medium">Skills & Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {electricianData.skills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {electricianData.skills.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                      +{electricianData.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-3 sm:p-4 border-t bg-gray-50 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-white"
              onClick={() => {
                setIsOpen(false);
                router.push("/electrician/profile");
              }}
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
