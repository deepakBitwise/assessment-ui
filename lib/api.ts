import type {
    Assessment,
    AssessmentResponse,
    AssessmentUpdatePayload,
    Submission,
} from '@/types/assessment';

import type {
    HumanReview,
} from '@/types/human-review';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8000/api/v1';



// =========================
// ASSESSMENTS
// =========================

export async function fetchAssessments(): Promise<AssessmentResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments/`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch assessments: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching assessments:', error);
        throw error;
    }
}

export async function updateAssessment(
    assessmentId: string,
    payload: AssessmentUpdatePayload
): Promise<Assessment> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/assessments/${assessmentId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to update assessment: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating assessment:', error);
        throw error;
    }
}



// =========================
// SUBMISSIONS
// =========================

export async function fetchSubmission(
    submissionId: string
): Promise<Submission> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/submissions/${submissionId}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch submission: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching submission:', error);
        throw error;
    }
}

export async function fetchSubmissions(): Promise<Submission[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch submissions: ${response.statusText}`
            );
        }

        const data = (await response.json()) as Submission[];

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error;
    }
}



// =========================
// HUMAN REVIEWS
// =========================

export async function fetchHumanReviews(): Promise<HumanReview[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/human-reviews`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch human reviews: ${response.statusText}`
            );
        }

        const data = (await response.json()) as HumanReview[];

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching human reviews:', error);
        throw error;
    }
}

export async function fetchHumanReview(
    humanReviewId: string
): Promise<HumanReview> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/human-reviews/${humanReviewId}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch human review: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching human review:', error);
        throw error;
    }
}

export async function submitHumanReview(
    humanReviewId: string,
    reviewerComments: string,
    finalVerdict: 'PASSED' | 'FAILED'
) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/human-reviews/${humanReviewId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reviewer_comments: reviewerComments,
                    final_verdict: finalVerdict,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to submit human review: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting human review:', error);
        throw error;
    }
}



// =========================
// FILE DOWNLOADS
// =========================

type DownloadUrlResponse = {
    download_url?: string;
    url?: string;
    presigned_url?: string;
    file_url?: string;
    public_url?: string;
};

export async function getPresignedDownloadUrl(
    filePath: string
): Promise<string> {
    try {
        const encodedPath = filePath
            .split('/')
            .map(encodeURIComponent)
            .join('/');

        const response = await fetch(
            `${API_BASE_URL}/files/download-url/${encodedPath}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(
                `Download URL request failed with ${response.statusText}`
            );
        }

        const payload =
            (await response.json()) as DownloadUrlResponse;

        const downloadUrl =
            payload.download_url ??
            payload.url ??
            payload.presigned_url ??
            payload.file_url ??
            payload.public_url;

        if (!downloadUrl) {
            throw new Error(
                'Download URL was not returned by the backend.'
            );
        }

        return downloadUrl;
    } catch (error) {
        console.error('Error generating download URL:', error);
        throw error;
    }
}