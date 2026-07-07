import { getOverallSubmissionStatus } from "@/lib/submission-status";
import type { Submission, SubmissionDetail } from "@/types/assessment";

export type SubmissionExportDetail = SubmissionDetail;

type SubmissionDetailFetcher = (
  submissionId: string
) => Promise<SubmissionExportDetail>;

type SubmissionDetailCache = Partial<
  Record<string, SubmissionExportDetail>
>;

type SubmissionExportRow = {
  submissionId: string;
  userId: string;
  assessmentId: string;
  overallStatus: string;
  automatedCheck: string;
  llmJudge: string;
  humanReviewer: string;
  attachmentObjectName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type SubmissionExportColumn = {
  key: keyof SubmissionExportRow;
  label: string;
  width: number;
  isDate?: boolean;
};

type SubmissionDetailsForExportOptions = {
  cache?: SubmissionDetailCache;
  concurrency?: number;
};

type SubmissionWorkbookOptions = {
  fileNamePrefix?: string;
  sheetName?: string;
};

const SUBMISSION_EXPORT_COLUMNS: SubmissionExportColumn[] = [
  { key: "submissionId", label: "Submission ID", width: 28 },
  { key: "userId", label: "User ID", width: 28 },
  { key: "assessmentId", label: "Assessment ID", width: 28 },
  { key: "overallStatus", label: "Overall Status", width: 16 },
  { key: "automatedCheck", label: "Automated Check", width: 18 },
  { key: "llmJudge", label: "LLM Judge", width: 18 },
  { key: "humanReviewer", label: "Human Reviewer", width: 18 },
  {
    key: "attachmentObjectName",
    label: "Attachment Object Name",
    width: 40,
  },
  { key: "createdAt", label: "Created At", width: 22, isDate: true },
  { key: "updatedAt", label: "Updated At", width: 22, isDate: true },
];

const EXCEL_DATE_FORMAT = "yyyy-mm-dd hh:mm:ss";
const DEFAULT_EXPORT_CONCURRENCY = 5;
const DEFAULT_FILE_PREFIX = "submissions";
const DEFAULT_SHEET_NAME = "Submissions";

function toWorkbookDate(value: string): Date | string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

function createExportFileName(prefix: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${stamp}.xlsx`;
}

async function mapWithConcurrency<TItem, TResult>(
  items: TItem[],
  concurrency: number,
  mapper: (item: TItem, index: number) => Promise<TResult>
): Promise<TResult[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<TResult>(items.length);
  const workerCount = Math.max(
    1,
    Math.min(concurrency, items.length)
  );
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await mapper(
        items[currentIndex],
        currentIndex
      );
    }
  }

  await Promise.all(
    Array.from({ length: workerCount }, () => worker())
  );

  return results;
}

function buildSubmissionExportRows(
  submissions: SubmissionExportDetail[]
): SubmissionExportRow[] {
  return submissions.map((submission) => ({
    submissionId: submission.id,
    userId: submission.user_id,
    assessmentId: submission.assessment_id,
    overallStatus: getOverallSubmissionStatus(submission),
    automatedCheck: submission.automated_check,
    llmJudge: submission.llm_judge,
    humanReviewer: submission.human_reviewer,
    attachmentObjectName:
      submission.attachment_object_name ?? "",
    createdAt: toWorkbookDate(submission.created_at),
    updatedAt: toWorkbookDate(submission.updated_at),
  }));
}

export async function fetchSubmissionDetailsForExport(
  submissions: Submission[],
  fetchSubmissionDetail: SubmissionDetailFetcher,
  options: SubmissionDetailsForExportOptions = {}
): Promise<SubmissionExportDetail[]> {
  const cache = options.cache ?? {};
  const concurrency =
    options.concurrency ?? DEFAULT_EXPORT_CONCURRENCY;
  const results: SubmissionExportDetail[] = [];
  const missingSubmissions: Array<{
    index: number;
    submissionId: string;
  }> = [];

  submissions.forEach((submission, index) => {
    const cachedDetail = cache[submission.id];

    if (cachedDetail) {
      results[index] = cachedDetail;
      return;
    }

    missingSubmissions.push({
      index,
      submissionId: submission.id,
    });
  });

  const fetchedDetails = await mapWithConcurrency(
    missingSubmissions,
    concurrency,
    async ({ submissionId }) =>
      fetchSubmissionDetail(submissionId)
  );

  fetchedDetails.forEach((detail, index) => {
    results[missingSubmissions[index].index] = detail;
  });

  return results;
}

export async function exportSubmissionsToExcel(
  submissions: SubmissionExportDetail[],
  options: SubmissionWorkbookOptions = {}
): Promise<void> {
  const XLSX = await import("xlsx");
  const rows = buildSubmissionExportRows(submissions);
  const worksheetData = [
    SUBMISSION_EXPORT_COLUMNS.map((column) => column.label),
    ...rows.map((row) =>
      SUBMISSION_EXPORT_COLUMNS.map((column) => row[column.key])
    ),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData, {
    cellDates: true,
  });

  worksheet["!cols"] = SUBMISSION_EXPORT_COLUMNS.map((column) => ({
    wch: column.width,
  }));

  if (worksheet["!ref"]) {
    worksheet["!autofilter"] = {
      ref: worksheet["!ref"],
    };
  }

  SUBMISSION_EXPORT_COLUMNS.forEach((column, columnIndex) => {
    if (!column.isDate) {
      return;
    }

    for (let rowIndex = 1; rowIndex < worksheetData.length; rowIndex += 1) {
      const cellAddress = XLSX.utils.encode_cell({
        c: columnIndex,
        r: rowIndex,
      });
      const cell = worksheet[cellAddress];

      if (cell?.t === "d" || cell?.t === "n") {
        cell.z = EXCEL_DATE_FORMAT;
      }
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    options.sheetName ?? DEFAULT_SHEET_NAME
  );

  XLSX.writeFile(
    workbook,
    createExportFileName(
      options.fileNamePrefix ?? DEFAULT_FILE_PREFIX
    ),
    {
      compression: true,
    }
  );
}
