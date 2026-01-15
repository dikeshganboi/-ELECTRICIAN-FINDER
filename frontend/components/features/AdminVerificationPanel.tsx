"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardList, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminVerification } from "@/hooks/useVerification";
import { VerificationSubmission } from "@/types";

interface AdminVerificationPanelProps {
  submission: VerificationSubmission;
  electricianName: string;
  onActionComplete?: () => void;
}

export function AdminVerificationPanel({
  submission,
  electricianName,
  onActionComplete
}: AdminVerificationPanelProps) {
  const [activeAction, setActiveAction] = useState<null | "approve" | "reject" | "info">(null);
  const [feedback, setFeedback] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [deadlineDays, setDeadlineDays] = useState(7);
  const { approveVerification, rejectVerification, requestMoreInfo, loading, error } =
    useAdminVerification();

  const handleApprove = async () => {
    try {
      await approveVerification(submission.submissionId, feedback);
      setFeedback("");
      setActiveAction(null);
      onActionComplete?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert("Rejection reason is required");
      return;
    }
    try {
      await rejectVerification(submission.submissionId, feedback, internalNotes);
      setFeedback("");
      setInternalNotes("");
      setActiveAction(null);
      onActionComplete?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestInfo = async () => {
    if (!feedback.trim()) {
      alert("Feedback is required");
      return;
    }
    try {
      await requestMoreInfo(submission.submissionId, feedback, deadlineDays);
      setFeedback("");
      setDeadlineDays(7);
      setActiveAction(null);
      onActionComplete?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{electricianName}</h3>
        <p className="text-sm text-gray-600">
          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Documents */}
      <div className="mb-6">
        <h4 className="mb-3 font-medium text-gray-900">Submitted Documents</h4>
        <div className="space-y-2">
          {submission.documents.map((doc) => (
            <div
              key={doc.documentId}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
            >
              <div className="flex-1">
                <p className="font-medium capitalize text-gray-900">{doc.type}</p>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View document
                </a>
              </div>
              {doc.expiresAt && (
                <p className="text-xs text-gray-600">
                  Expires: {new Date(doc.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Previous admin review */}
      {submission.adminReview && submission.adminReview.decision && (
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-medium text-gray-900">Previous Review</h4>
          <p className="text-sm">
            <span className="font-medium">Decision:</span>{" "}
            <span className="capitalize">{submission.adminReview.decision}</span>
          </p>
          {submission.adminReview.feedback && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Feedback:</span> {submission.adminReview.feedback}
            </p>
          )}
          {submission.adminReview.reviewedAt && (
            <p className="mt-1 text-xs text-gray-600">
              Reviewed {new Date(submission.adminReview.reviewedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Action section */}
      {submission.status === "pending" && (
        <div className="space-y-4">
          {/* Approve Action */}
          {activeAction === "approve" ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-3 font-medium text-green-900">Approve Verification</p>
              <textarea
                placeholder="Optional feedback to show to electrician..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={loading}
                className="mb-3 w-full rounded-lg border border-green-200 p-2 text-sm"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveAction(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Approving..." : "Approve"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2 border-green-200 text-green-600 hover:bg-green-50"
              onClick={() => {
                setActiveAction("approve");
                setFeedback("");
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
          )}

          {/* Reject Action */}
          {activeAction === "reject" ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="mb-3 font-medium text-red-900">Reject Verification</p>
              <textarea
                placeholder="Reason for rejection (visible to electrician) *"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={loading}
                className="mb-3 w-full rounded-lg border border-red-200 p-2 text-sm"
                rows={3}
              />
              <textarea
                placeholder="Internal notes (not visible to electrician)"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                disabled={loading}
                className="mb-3 w-full rounded-lg border border-red-200 p-2 text-sm"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveAction(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReject}
                  disabled={loading || !feedback.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                setActiveAction("reject");
                setFeedback("");
                setInternalNotes("");
              }}
            >
              <AlertCircle className="h-4 w-4" />
              Reject
            </Button>
          )}

          {/* Request Info Action */}
          {activeAction === "info" ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-3 font-medium text-yellow-900">Request More Information</p>
              <textarea
                placeholder="Feedback and what you need from electrician *"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={loading}
                className="mb-3 w-full rounded-lg border border-yellow-200 p-2 text-sm"
                rows={3}
              />
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700">
                  Deadline (days)
                </label>
                <select
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                  disabled={loading}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {[3, 5, 7, 14, 30].map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveAction(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleRequestInfo}
                  disabled={loading || !feedback.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {loading ? "Sending..." : "Request Info"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              onClick={() => {
                setActiveAction("info");
                setFeedback("");
                setDeadlineDays(7);
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Request More Info
            </Button>
          )}
        </div>
      )}

      {/* Status badges */}
      {submission.status !== "pending" && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3">
          <ClipboardList className="h-5 w-5 text-gray-600" />
          <div>
            <p className="font-medium capitalize text-gray-900">{submission.status}</p>
            {submission.adminReview?.reviewedAt && (
              <p className="text-xs text-gray-600">
                Reviewed {new Date(submission.adminReview.reviewedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
