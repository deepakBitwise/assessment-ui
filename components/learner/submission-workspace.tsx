"use client";

import { useEffect, useId, useState, type ChangeEvent } from "react";
import { getPresignedDownloadUrl } from "@/lib/api";
import type {
  ActiveAssessment,
  SubmissionField,
  SubmissionWorkspace as SubmissionWorkspaceData
} from "@/types/assessment";
import { DEFAULT_USER_ID } from "@/data/constants";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

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
  assessment: ActiveAssessment;
  workspace: SubmissionWorkspaceData;
  onSubmissionSubmitted: (submissionId: string) => void;
  username: string;
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

function getUploadField(
  fields: SubmissionWorkspaceData["fields"]
): SubmissionField | undefined {
  return fields.find((field) => field.variant === "upload");
}

export function SubmissionWorkspace({
  assessment,
  workspace,
  onSubmissionSubmitted,
  username
}: SubmissionWorkspaceProps) {
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
  const uploadField = getUploadField(workspace.fields);
  const backendFileName = uploadField?.fileName ?? null;
  const hasBackendFile = typeof backendFileName === "string" && backendFileName.trim().length > 0;

  const hasZipSelection = Boolean(selectedZip);
  const isZipUploaded = uploadState === "uploaded" || uploadState === "submitted";
  const isBusy = uploadState === "uploading" || uploadState === "submitting";

  useEffect(() => {
    if (hasBackendFile) {
      setStatusMessage(
        `${backendFileName} is already attached to this assessment. You can download it or reupload a new ZIP.`
      );
      return;
    }

    setStatusMessage("Upload a single .zip file to enable submission.");
  }, [backendFileName, hasBackendFile]);

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

      const uploadUrlResponse = await fetch(`${API_BASE_URL}/files/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: selectedZip.name,
          content_type: selectedZip.type || "application/zip",
          assessment_id: assessment.id
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

    try {
      setUploadState("submitting");
      setStatusMessage("Submitting assessment...");

      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assessment_id: assessment.id,
          user_id: username || DEFAULT_USER_ID,
        })
      });

      if (!response.ok) {
        throw new Error(`Assessment submission failed with ${response.status}.`);
      }

      const payload = await response.json();
      const submissionId = payload?.submission_id ?? null;

      if (submissionId) {
        onSubmissionSubmitted(submissionId);
      }

      setUploadState("submitted");
      setStatusMessage(
        `Solution with : ${selectedZip?.name ?? "Submission ZIP"} submitted successfully.` +
        (submissionId ? ` Submission ID: ${submissionId}.` : "") +
        (uploadedFileKey ? ` File key: ${uploadedFileKey}.` : "") +
        (uploadedFileUrl ? ` File URL: ${uploadedFileUrl}.` : "")
      );
    } catch (error) {
      setUploadState("uploaded");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Assessment submission failed. Please try again."
      );
    }
  }

  async function handleDownload() {
    if (!hasBackendFile || !backendFileName) {
      setStatusMessage("No existing submission file is available to download.");
      return;
    }

    try {
      setStatusMessage("Requesting download URL...");
      const downloadUrl = await getPresignedDownloadUrl(backendFileName);

      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.download = backendFileName.split("/").pop() ?? "download.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setStatusMessage(`Download started for ${backendFileName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Download failed. Please try again."
      );
    }
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
                hasBackendFile ? (
                  <div className="upload-box__content">
                    <strong>{backendFileName}</strong>
                    <span>{field.value}</span>
                    <div className="upload-box__actions">
                      <button
                        className="button button--secondary upload-box__action"
                        onClick={handleDownload}
                        type="button"
                      >
                        Download
                      </button>
                      <label className="button button--secondary upload-box__action" htmlFor={fileInputId}>
                        Select File
                        <input
                          accept=".zip,application/zip"
                          className="upload-control__input"
                          id={fileInputId}
                          onChange={handleZipChange}
                          type="file"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="upload-control" htmlFor={fileInputId}>
                    <input
                      accept=".zip,application/zip"
                      className="upload-control__input"
                      id={fileInputId}
                      onChange={handleZipChange}
                      type="file"
                    />
                    <strong>{selectedZip?.name ?? "No file uploaded yet"}</strong>
                    <br />
                    <span>{field.value}</span>
                  </label>
                )
              ) : (
                field.value
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="submission-actions">
        <p className="submission-actions__note">
          {hasBackendFile
            ? "A previous submission already exists for this assessment."
            : "ZIP upload is mandatory before assessment submission."}
        </p>
        <div className="submission-actions__buttons">
          <button
            className="button button--secondary"
            disabled={!hasZipSelection || isBusy}
            onClick={handleUpload}
            type="button"
          >
            {uploadState === "uploading"
              ? "Uploading..."
              : hasBackendFile
                ? "Reupload ZIP"
                : "Upload ZIP"}
          </button>
          <button
            className="button button--primary"
            // disabled={!isZipUploaded || isBusy}
            disabled={isBusy}
            onClick={handleFinalSubmit}
            type="button"
          >
            {uploadState === "submitting"
              ? "Submitting..."
              : "Assessment Submission"}
          </button>
        </div>
        <p className="submission-actions__status" role="status">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}
