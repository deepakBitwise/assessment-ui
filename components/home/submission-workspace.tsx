"use client";

import { useId, useState } from "react";
import type {
  SubmissionField,
  SubmissionWorkspace as SubmissionWorkspaceData
} from "@/types/assessment";

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
  const [selectedZip, setSelectedZip] = useState<string | null>(null);

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
                    onChange={(event) =>
                      setSelectedZip(event.target.files?.[0]?.name ?? null)
                    }
                    type="file"
                  />
                  <strong>{selectedZip ?? field.fileName}</strong>
                  <span>{field.value}</span>
                </label>
              ) : (
                field.value
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
