"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";

interface RatingModalProps {
  bookingId: string;
  electricianName: string;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
}

export function RatingModal({
  bookingId,
  electricianName,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(rating, review);
      alert("Thank you for your rating!");
      onClose();
    } catch (error) {
      alert("Failed to submit rating: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Rate Service</h2>
            <p className="text-gray-600 text-sm">{electricianName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Rating */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-4 text-center">
              How was your experience?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-12 w-12 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-gray-600 text-sm mt-2">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Write a Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
