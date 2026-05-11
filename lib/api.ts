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
