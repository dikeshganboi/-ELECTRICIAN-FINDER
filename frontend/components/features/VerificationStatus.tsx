"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrentVerification } from "@/types";

interface VerificationStatusProps {
  status: string;
  currentVerification?: CurrentVerification;
  verificationExpiresAt?: Date;
  onUploadClick: () => void;
}

export function VerificationStatus({
  status,
  currentVerification,
  verificationExpiresAt,
  onUploadClick
}: VerificationStatusProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [canResubmit, setCanResubmit] = useState(false);

  // Format countdown timer
  useEffect(() => {
    if (!currentVerification?.resubmitAt) {
      setCanResubmit(true);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const resubmitDate = new Date(currentVerification.resubmitAt!);
      const diff = resubmitDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCanResubmit(true);
        setTimeLeft("");
      } else {
        setCanResubmit(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currentVerification?.resubmitAt]);

  // Format expiry countdown
  const getExpiryCountdown = () => {
    if (!verificationExpiresAt) return null;
    const now = new Date();
    const expiry = new Date(verificationExpiresAt);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft} days` : "Expired";
  };

  const statusConfig: Record<string, { color: string; icon: any; title: string; description: string }> = {
    not_submitted: {
      color: "bg-slate-100 border-slate-300",
      icon: AlertCircle,
      title: "Verification Not Started",
      description: "Submit your documents to start the verification process"
    },
    pending: {
      color: "bg-blue-100 border-blue-300",
      icon: Clock,
      title: "Verification Pending",
      description: "Your documents are under review. We'll notify you once verified."
    },
    approved: {
      color: "bg-green-100 border-green-300",
      icon: CheckCircle2,
      title: "Verification Approved",
      description: "You're all set! You can now go online and accept bookings."
    },
    rejected: {
      color: "bg-red-100 border-red-300",
      icon: AlertTriangle,
      title: "Verification Rejected",
      description: currentVerification?.lastRejectionReason || "Your verification was rejected. Please review the reason and resubmit."
    },
    needs_info: {
      color: "bg-yellow-100 border-yellow-300",
      icon: AlertCircle,
      title: "More Information Needed",
      description: "Please provide additional information to complete your verification."
    },
    expired: {
      color: "bg-orange-100 border-orange-300",
      icon: Clock,
      title: "Verification Expired",
      description: "Your verification has expired. Please renew it to continue accepting bookings."
    }
  };

  const config = statusConfig[status] || statusConfig.not_submitted;
  const IconComponent = config.icon;

  return (
    <div className={`rounded-lg border-2 p-6 ${config.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <IconComponent className="mt-1 h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold">{config.title}</h3>
            <p className="text-sm text-gray-700">{config.description}</p>

            {/* Show cooldown timer for rejected/needs_info */}
            {(status === "rejected" || status === "needs_info") && !canResubmit && (
              <p className="mt-2 text-xs font-medium text-gray-600">
                Can resubmit in: {timeLeft}
              </p>
            )}

            {/* Show expiry for approved */}
            {status === "approved" && verificationExpiresAt && (
              <p className="mt-2 text-xs font-medium text-gray-600">
                Expires in: {getExpiryCountdown()}
              </p>
            )}

            {/* Show submission history link */}
            {status === "pending" && (
              <p className="mt-2 text-xs text-gray-600">
                Submitted on {currentVerification?.submittedAt ? new Date(currentVerification.submittedAt).toLocaleDateString() : ""}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div>
          {status === "not_submitted" && (
            <Button onClick={onUploadClick} className="gap-2">
              <Upload className="h-4 w-4" />
              Submit Documents
            </Button>
          )}

          {status === "rejected" && canResubmit && (
            <Button onClick={onUploadClick} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Resubmit
            </Button>
          )}

          {status === "needs_info" && canResubmit && (
            <Button onClick={onUploadClick} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Submit Update
            </Button>
          )}

          {status === "expired" && (
            <Button onClick={onUploadClick} className="gap-2">
              <Upload className="h-4 w-4" />
              Renew Verification
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
