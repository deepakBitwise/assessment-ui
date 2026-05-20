import type {
    Assessment,
    AssessmentResponse,
    AssessmentUpdatePayload,
    SubmissionDetail,
    SubmissionEventHistory,
    Submission,
    SubmissionEvent,
    SubmissionStatus,
} from '@/types/assessment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface CurrentUserResponse {
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    role: 'LEARNER' | 'REVIEWER' | 'ADMIN';
    is_active: boolean;
    is_superuser: boolean;
    created_at: string | null;
}

export interface SignupPayload {
    full_name: string;
    username: string;
    email: string;
    password: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    try {
        // Use FormData for proper form-urlencoded encoding
        const formData = new FormData();
        formData.append('username', username.trim().toLowerCase());
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/login/access-token`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = `Login failed with status ${response.status}`;
            
            try {
                if (contentType?.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        if (typeof errorData.detail === 'string') {
                            errorMessage = errorData.detail;
                        } else if (Array.isArray(errorData.detail)) {
                            errorMessage = errorData.detail.map((e: any) => e.msg).join(', ');
                        }
                    }
                } else {
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }
            } catch (e) {
                console.error('Failed to parse error response:', e);
            }
            
            throw new Error(String(errorMessage));
        }

        const data: LoginResponse = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        const errorMessage = `Unknown error: ${String(error)}`;
        throw new Error(errorMessage);
    }
}

export async function signup(payload: SignupPayload): Promise<CurrentUserResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = `Sign up failed with status ${response.status}`;

            if (contentType?.includes('application/json')) {
                const errorData = await response.json();
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(', ');
                }
            }

            throw new Error(errorMessage);
        }

        return await response.json() as CurrentUserResponse;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUserResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/login/test-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to get current user: ${response.statusText}`);
        }

        const data: CurrentUserResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
    }
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/login/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            throw new Error(`Failed to refresh session: ${response.statusText}`);
        }

        const data: LoginResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}

export async function logout(accessToken: string): Promise<{ message: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Logout failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
}

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

export async function fetchSubmission(submissionId: string): Promise<SubmissionDetail> {
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

        const data = (await response.json()) as SubmissionDetail;
        return data;
    } catch (error) {
        console.error('Error fetching submission:', error);
        throw error;
    }
}

export async function fetchSubmissionEvents(
    submissionId: string
): Promise<SubmissionEventHistory> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/submission/${submissionId}/events`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch submission events: ${response.statusText}`);
        }

        const data = (await response.json()) as SubmissionEventHistory;
        return {
            ...data,
            events: Array.isArray(data.events) ? data.events : [],
        };
    } catch (error) {
        console.error('Error fetching submission events:', error);
        throw error;
    }
}

export async function fetchSubmissions(): Promise<Submission[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch submissions: ${response.statusText}`);
        }

        const data = (await response.json()) as Submission[];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error;
    }
}

export type HumanReviewVerdict = 'PASSED' | 'REJECTED';

export type HumanReview = {
    id: string;
    submission_id: string;
    reviewer_comments: string | null;
    final_verdict: string;
    evaluator_payload: any;
    created_at: string;
    updated_at: string;
};

export type SubmitHumanReviewPayload = {
    reviewer_comments: string;
    final_verdict: HumanReviewVerdict;
};

export type SubmissionStatusUpdatePayload = {
    automated_check: SubmissionStatus;
    llm_judge: SubmissionStatus;
    human_reviewer: SubmissionStatus;
};

export async function submitHumanReview(
    reviewId: string,
    payload: SubmitHumanReviewPayload
): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/human-reviews/${reviewId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to submit review: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error submitting human review:', error);
        throw error;
    }
}

export async function fetchHumanReviews(): Promise<HumanReview[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/human-reviews/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch human reviews: ${response.statusText}`);
        }

        const data = await response.json();
        const reviewList = Array.isArray(data) ? data : data.data || [];
        return Array.isArray(reviewList) ? reviewList : [];
    } catch (error) {
        console.error('Error fetching human reviews:', error);
        throw error;
    }
}

export async function updateSubmissionStatus(
    submissionId: string,
    payload: SubmissionStatusUpdatePayload
): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to update submission status: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error updating submission status:', error);
        throw error;
    }
}

export async function pushSubmissionEvent(
    submissionId: string,
    event: SubmissionEvent
): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/submission/${submissionId}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            throw new Error(`Failed to push submission event: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error pushing submission event:', error);
        throw error;
    }
}

export async function pushSubmissionEvents(
    submissionId: string,
    events: SubmissionEvent[]
): Promise<void> {
    await Promise.all(events.map((event) => pushSubmissionEvent(submissionId, event)));
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
