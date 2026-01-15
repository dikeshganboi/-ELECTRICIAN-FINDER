import { useState, useCallback } from "react";
import { env } from "@/lib/env";

interface VerificationFormData {
  requiredDocuments: Array<{ type: string; required: boolean; expiryRequired: boolean }>;
  previousSubmissions: any[];
  canResubmitAt?: Date;
}

interface SubmissionDocument {
  type: string;
  url: string;
  expiresAt?: string;
}

export const useVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VerificationFormData | null>(null);

  const fetchForm = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/verification/form`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch verification form");
      }

      const data = await response.json();
      setFormData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch form");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitVerification = useCallback(
    async (documents: SubmissionDocument[]) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${env.apiBaseUrl}/api/verification/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({ documents })
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific errors with timing info
          if (data.error === "RESUBMIT_COOLDOWN") {
            const minutesLeft = data.canResubmitAt 
              ? Math.ceil((new Date(data.canResubmitAt).getTime() - Date.now()) / (60 * 1000))
              : 0;
            throw new Error(`Please wait ${minutesLeft} minutes before resubmitting`);
          }
          throw new Error(data.message || "Submission failed");
        }

        return data.submission;
      } catch (err: any) {
        setError(err.message || "Failed to submit verification");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    formData,
    fetchForm,
    submitVerification
  };
};

export const useAdminVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveVerification = useCallback(async (submissionId: string, feedback?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/verification/admin/approve/${submissionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ feedback })
      });

      if (!response.ok) {
        throw new Error("Failed to approve verification");
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message || "Failed to approve");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectVerification = useCallback(
    async (submissionId: string, reason: string, internalNotes?: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${env.apiBaseUrl}/api/verification/admin/reject/${submissionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({ reason, internalNotes })
        });

        if (!response.ok) {
          throw new Error("Failed to reject verification");
        }

        return await response.json();
      } catch (err: any) {
        setError(err.message || "Failed to reject");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const requestMoreInfo = useCallback(
    async (submissionId: string, feedback: string, deadlineDays: number = 7) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${env.apiBaseUrl}/api/verification/admin/request-info/${submissionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify({ feedback, deadlineDays })
          }
        );

        if (!response.ok) {
          throw new Error("Failed to request more info");
        }

        return await response.json();
      } catch (err: any) {
        setError(err.message || "Failed to request info");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    approveVerification,
    rejectVerification,
    requestMoreInfo
  };
};
