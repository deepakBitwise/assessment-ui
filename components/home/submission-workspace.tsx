"use client";

import { useId, useState, type ChangeEvent } from "react";
import type {
  SubmissionField,
  SubmissionWorkspace as SubmissionWorkspaceData
} from "@/types/assessment";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type UploadUrlResponse = {
  upload_url?: string;
  url?: string;
  presigned_url?: string;
  file_url?: string;
  public_url?: string;
  key?: string;
  file_key?: string;
};

type SubmissionWorkspaceProps = {
  workspace: SubmissionWorkspaceData;
};

function getFieldClassName(field: SubmissionField) {
  const classes = ["form-card"];

  if (field.fullWidth) {
    classes.push("form-card--full");
  }

  if (field.variant === "upload") {
    classes.push("form-card--upload");
  }

  return classes.join(" ");
}

function getValueClassName(field: SubmissionField) {
  switch (field.variant) {
    case "upload":
      return "upload-box";
    case "textarea":
      return "textarea-row";
    default:
      return "input-row";
  }
}

export function SubmissionWorkspace({ workspace }: SubmissionWorkspaceProps) {
  const fileInputId = useId();
  const [selectedZip, setSelectedZip] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "ready" | "uploading" | "uploaded" | "submitting" | "submitted"
  >("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Upload a single .zip file to enable submission."
  );
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);

  const hasZipSelection = Boolean(selectedZip);
  const isZipUploaded = uploadState === "uploaded" || uploadState === "submitted";
  const isBusy = uploadState === "uploading" || uploadState === "submitting";

  function handleZipChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    if (!nextFile) {
      setSelectedZip(null);
      setUploadState("idle");
      setStatusMessage("Upload a single .zip file to enable submission.");
      return;
    }

    const isZipFile =
      nextFile.name.toLowerCase().endsWith(".zip") ||
      nextFile.type === "application/zip";

    if (!isZipFile) {
      setSelectedZip(null);
      setUploadState("idle");
      setStatusMessage("Only .zip files are allowed for this submission.");
      event.target.value = "";
      return;
    }

    setSelectedZip(nextFile);
    setUploadedFileUrl(null);
    setUploadedFileKey(null);
    setUploadState("ready");
    setStatusMessage("ZIP selected. Use Upload ZIP before final submission.");
  }

  async function handleUpload() {
    if (!selectedZip) {
      setStatusMessage("A .zip file is required before upload.");
      return;
    }

    try {
      setUploadState("uploading");
      setStatusMessage("Requesting upload URL...");

      const uploadUrlResponse = await fetch(`${API_BASE_URL}/api/v1/files/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: selectedZip.name,
          content_type: selectedZip.type || "application/zip"
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Upload URL request failed with ${uploadUrlResponse.status}.`);
      }

      const uploadUrlPayload = (await uploadUrlResponse.json()) as UploadUrlResponse;
      const uploadUrl =
        uploadUrlPayload.upload_url ??
        uploadUrlPayload.url ??
        uploadUrlPayload.presigned_url;

      if (!uploadUrl) {
        throw new Error("Upload URL was not returned by the backend.");
      }

      setStatusMessage("Uploading ZIP to storage...");

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedZip.type || "application/zip"
        },
        body: selectedZip
      });

      if (!uploadResponse.ok) {
        throw new Error(`ZIP upload failed with ${uploadResponse.status}.`);
      }

      setUploadedFileUrl(uploadUrlPayload.file_url ?? uploadUrlPayload.public_url ?? null);
      setUploadedFileKey(uploadUrlPayload.key ?? uploadUrlPayload.file_key ?? null);
      setUploadState("uploaded");
      setStatusMessage(`${selectedZip.name} uploaded successfully. Final submit is enabled.`);
    } catch (error) {
      setUploadState("ready");
      setUploadedFileUrl(null);
      setUploadedFileKey(null);
      setStatusMessage(
        error instanceof Error ? error.message : "ZIP upload failed. Please try again."
      );
    }
  }

  async function handleFinalSubmit() {
    if (!isZipUploaded) {
      setStatusMessage("Upload the required .zip before final submission.");
      return;
    }

    setUploadState("submitting");
    setStatusMessage(
      `${selectedZip?.name ?? "Submission ZIP"} is ready for your submission API call.` +
        (uploadedFileKey ? ` File key: ${uploadedFileKey}.` : "") +
        (uploadedFileUrl ? ` File URL: ${uploadedFileUrl}.` : "")
    );
    setUploadState("submitted");
  }

  return (
    <div className="panel submission-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Submission Workspace</p>
          <h2>{workspace.title}</h2>
        </div>
      </div>

      <div className="submission-shell">
        {workspace.fields.map((field) => (
          <div className={getFieldClassName(field)} key={field.label}>
            <div className="form-card__label">{field.label}</div>
            <div className={getValueClassName(field)}>
              {field.variant === "upload" ? (
                <label className="upload-control" htmlFor={fileInputId}>
                  <input
                    accept=".zip,application/zip"
                    className="upload-control__input"
                    id={fileInputId}
                    onChange={handleZipChange}
                    type="file"
                  />
                  <strong>{selectedZip?.name ?? field.fileName}</strong>
                  <br />
                  <span>{field.value}</span>
                </label>
              ) : (
                field.value
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="submission-actions">
        <p className="submission-actions__note">
          ZIP upload is mandatory before final submit.
        </p>
        <div className="submission-actions__buttons">
          <button
            className="button button--secondary"
            disabled={!hasZipSelection || isBusy}
            onClick={handleUpload}
            type="button"
          >
            {uploadState === "uploading" ? "Uploading..." : "Upload ZIP"}
          </button>
          <button
            className="button button--primary"
            disabled={!isZipUploaded || isBusy}
            onClick={handleFinalSubmit}
            type="button"
          >
            {uploadState === "submitting" ? "Submitting..." : "Final Submit"}
          </button>
        </div>
        <p className="submission-actions__status" role="status">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}
