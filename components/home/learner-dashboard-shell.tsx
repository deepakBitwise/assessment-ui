"use client";

import { useEffect, useState } from "react";
import { LearnerDashboard } from "@/components/home/learner-dashboard";
import type { DashboardContent } from "@/types/assessment";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type AssessmentResponse = {
  id?: string | null;
  problem_statement?: string | null;
  deliverables?: string[] | string | null;
  attachment_object_name?: string | null;
};

type LearnerDashboardShellProps = {
  initialContent: DashboardContent;
};

function isNonEmptyText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeDeliverables(
  value: AssessmentResponse["deliverables"]
): string[] | null {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    return items.length > 0 ? items : null;
  }

  if (typeof value === "string") {
    const items = value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    return items.length > 0 ? items : null;
  }

  return null;
}

export function LearnerDashboardShell({
  initialContent
}: LearnerDashboardShellProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    let isActive = true;

    async function loadAssessment() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/assessments/${initialContent.activeAssessment.id}`,
          {
            method: "GET",
            headers: {
              accept: "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Assessment fetch failed with ${response.status}.`);
        }

        const payload = (await response.json()) as AssessmentResponse;
        const nextDeliverables = normalizeDeliverables(payload.deliverables);

        if (!isActive) {
          return;
        }

        setContent((currentContent) => ({
          ...currentContent,
          activeAssessment: {
            ...currentContent.activeAssessment,
            id: isNonEmptyText(payload.id)
              ? payload.id
              : initialContent.activeAssessment.id,
            scenarioBody: isNonEmptyText(payload.problem_statement)
              ? payload.problem_statement
              : initialContent.activeAssessment.scenarioBody,
            deliverables:
              nextDeliverables ?? initialContent.activeAssessment.deliverables
          },
          submissionWorkspace: {
            ...currentContent.submissionWorkspace,
            fields: currentContent.submissionWorkspace.fields.map((field) =>
              field.variant === "upload"
                ? {
                    ...field,
                    fileName:
                      payload.attachment_object_name === null
                        ? null
                        : isNonEmptyText(payload.attachment_object_name)
                          ? payload.attachment_object_name
                          : initialContent.submissionWorkspace.fields.find(
                              (initialField) => initialField.variant === "upload"
                            )?.fileName
                  }
                : field
            )
          }
        }));
      } catch {
        if (!isActive) {
          return;
        }

        setContent(initialContent);
      }
    }

    loadAssessment();

    return () => {
      isActive = false;
    };
  }, [initialContent]);

  return <LearnerDashboard content={content} />;
}
