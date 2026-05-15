import type { AssessmentResponse, AssessmentUpdatePayload, Assessment } from '@/types/assessment';

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

export async function fetchSubmission(submissionId: string): Promise<unknown> {
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
