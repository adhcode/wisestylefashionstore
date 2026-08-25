"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface SatisfactionRatingModalProps {
  jobNumber: string;
  tailorName: string | null;
  onSubmit: (rating: number) => void;
  onCancel: () => void;
  pending?: boolean;
}

export function SatisfactionRatingModal({
  jobNumber,
  tailorName,
  onSubmit,
  onCancel,
  pending = false,
}: SatisfactionRatingModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  const displayRating = hoveredRating || rating;

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1:
        return "Very Unsatisfied";
      case 2:
        return "Unsatisfied";
      case 3:
        return "Neutral";
      case 4:
        return "Satisfied";
      case 5:
        return "Very Satisfied";
      default:
        return "";
    }
  };

  return (
    <Modal title="Job Completion Satisfaction" onClose={onCancel}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Job {jobNumber}</p>
          <h3 className="text-lg font-semibold text-gray-900">
            Was the customer satisfied with the work?
          </h3>
          {tailorName && (
            <p className="text-sm text-gray-600 mt-2">
              Tailor: <span className="font-medium text-gray-900">{tailorName}</span>
            </p>
          )}
        </div>

        {/* Rating Stars */}
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
                disabled={pending}
              >
                <Star
                  size={48}
                  className={`transition-colors ${
                    star <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{displayRating} / 5</p>
            <p className="text-sm font-medium text-gray-600 mt-1">
              {getRatingLabel(displayRating)}
            </p>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            This rating helps track tailor performance and will be used to calculate their average satisfaction score.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(rating)}
            disabled={pending}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-60 shadow-sm"
          >
            {pending ? "Submitting…" : "Submit Rating & Complete Job"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
