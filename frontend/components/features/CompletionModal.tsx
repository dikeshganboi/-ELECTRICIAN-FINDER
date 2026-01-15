"use client";

import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CompletionModalProps {
  bookingId: string;
  electricianName: string;
  onCompleted: () => void;
  onCancel: () => void;
}

export function CompletionModal({
  bookingId,
  electricianName,
  onCompleted,
  onCancel,
}: CompletionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Service Completed</h2>
          <p className="text-gray-600">
            Thank you for choosing {electricianName}. Please confirm the work is complete.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Confirming..." : "Confirm Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
