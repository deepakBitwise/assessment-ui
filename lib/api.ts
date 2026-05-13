import type { AssessmentResponse, AssessmentUpdatePayload, Assessment } from '@/types/assessment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchAssessments(): Promise<AssessmentResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch assessments: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
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
        const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to update assessment: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating assessment:', error);
        throw error;
    }
}

export async function fetchSubmission(submissionId: string) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/submissions/${submissionId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch submission: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching submission:', error);
        throw error;
    }
type DownloadUrlResponse = {
    download_url?: string;
    url?: string;
    presigned_url?: string;
    file_url?: string;
    public_url?: string;
};

export async function getPresignedDownloadUrl(filePath: string): Promise<string> {
    const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');

    const response = await fetch(`${API_BASE_URL}/files/download-url/${encodedPath}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Download URL request failed with ${response.statusText}`);
    }

    const payload = (await response.json()) as DownloadUrlResponse;
    const downloadUrl =
        payload.download_url ??
        payload.url ??
        payload.presigned_url ??
        payload.file_url ??
        payload.public_url;

    if (!downloadUrl) {
        throw new Error('Download URL was not returned by the backend.');
    }

    return downloadUrl;
}
