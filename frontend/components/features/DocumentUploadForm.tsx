"use client";

import { useState, useRef } from "react";
import { AlertCircle, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerification } from "@/hooks/useVerification";

interface DocumentUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Document {
  type: "aadhaar" | "certificate" | "photo";
  url: string;
  expiresAt?: string;
  file?: File;
}

export function DocumentUploadForm({ isOpen, onClose, onSuccess }: DocumentUploadFormProps) {
  const [documents, setDocuments] = useState<Document[]>([
    { type: "aadhaar", url: "", expiresAt: "" },
    { type: "certificate", url: "" },
    { type: "photo", url: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { submitVerification } = useVerification();

  if (!isOpen) return null;

  const handleFileSelect = async (docType: string, file: File | null) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Upload file to cloud storage (S3, Azure Blob, etc.)
      // For now, we'll use a mock URL
      const mockUrl = URL.createObjectURL(file);

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.type === docType
            ? { ...doc, file, url: mockUrl }
            : doc
        )
      );
    } catch (err: any) {
      setError(`Failed to upload ${docType}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (docType: string, date: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.type === docType
          ? { ...doc, expiresAt: date }
          : doc
      )
    );
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate documents
    const emptyDocs = documents.filter((d) => !d.url);
    if (emptyDocs.length > 0) {
      setError(`Please upload: ${emptyDocs.map((d) => d.type).join(", ")}`);
      return;
    }

    // Validate dates
    const aadhaar = documents.find((d) => d.type === "aadhaar");
    if (!aadhaar?.expiresAt) {
      setError("Aadhaar expiry date is required");
      return;
    }

    try {
      setLoading(true);
      await submitVerification(
        documents.map((d) => ({
          type: d.type,
          url: d.url,
          expiresAt: d.expiresAt
        }))
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Submit Verification Documents</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Documents */}
        <div className="space-y-6">
          {/* Aadhaar */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Aadhaar Card <span className="text-red-500">*</span>
              </label>
              {documents[0]?.url && <Check className="h-5 w-5 text-green-500" />}
            </div>

            {documents[0]?.url ? (
              <div className="space-y-3">
                <a
                  href={documents[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View uploaded file
                </a>
              </div>
            ) : (
              <input
                type="file"
                ref={(el) => { if (el) fileInputRefs.current["aadhaar"] = el; }}
                accept="image/*,.pdf"
                onChange={(e) => handleFileSelect("aadhaar", e.target.files?.[0] || null)}
                className="hidden"
              />
            )}

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current["aadhaar"]?.click()}
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {documents[0]?.url ? "Change" : "Upload"}
              </Button>

              {documents[0]?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDocuments((prev) =>
                      prev.map((d) =>
                        d.type === "aadhaar" ? { ...d, url: "", expiresAt: "" } : d
                      )
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Expiry date for Aadhaar */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={documents[0]?.expiresAt || ""}
                onChange={(e) => handleDateChange("aadhaar", e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Certificate */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Electrical License/Certificate <span className="text-red-500">*</span>
              </label>
              {documents[1]?.url && <Check className="h-5 w-5 text-green-500" />}
            </div>

            {documents[1]?.url ? (
              <a
                href={documents[1].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View uploaded file
              </a>
            ) : (
              <input
                type="file"
                ref={(el) => { if (el) fileInputRefs.current["certificate"] = el; }}
                accept="image/*,.pdf"
                onChange={(e) => handleFileSelect("certificate", e.target.files?.[0] || null)}
                className="hidden"
              />
            )}

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current["certificate"]?.click()}
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {documents[1]?.url ? "Change" : "Upload"}
              </Button>

              {documents[1]?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDocuments((prev) =>
                      prev.map((d) =>
                        d.type === "certificate" ? { ...d, url: "" } : d
                      )
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Photo */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Professional Photo <span className="text-red-500">*</span>
              </label>
              {documents[2]?.url && <Check className="h-5 w-5 text-green-500" />}
            </div>

            {documents[2]?.url ? (
              <a
                href={documents[2].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View uploaded file
              </a>
            ) : (
              <input
                type="file"
                ref={(el) => { if (el) fileInputRefs.current["photo"] = el; }}
                accept="image/*"
                onChange={(e) => handleFileSelect("photo", e.target.files?.[0] || null)}
                className="hidden"
              />
            )}

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current["photo"]?.click()}
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {documents[2]?.url ? "Change" : "Upload"}
              </Button>

              {documents[2]?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDocuments((prev) =>
                      prev.map((d) =>
                        d.type === "photo" ? { ...d, url: "" } : d
                      )
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      </div>
    </div>
  );
}
