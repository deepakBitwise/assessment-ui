'use client';

import { useEffect, useState } from 'react';
import type { Assessment, AssessmentUpdatePayload } from '@/types/assessment';
import { fetchAssessments, updateAssessment, fetchUsers, enrollUserInAssessment, unenrollUserFromAssessment } from '@/lib/api';
import type { UserResponse } from '@/lib/api';
import { getStoredAccessToken } from '@/lib/auth';
import styles from './assessment-list.module.css';

type RoleFilter = 'LEARNER' | 'ALL';

export function AssessmentList() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<AssessmentUpdatePayload>({
        problem_statement: '',
        deliverables: [],
    });
    const [isSaving, setIsSaving] = useState(false);

    // Enrollment state
    const [enrollingAssessmentId, setEnrollingAssessmentId] = useState<string | null>(null);
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [enrollingUserId, setEnrollingUserId] = useState<string | null>(null);
    const [enrolledPairs, setEnrolledPairs] = useState<Set<string>>(new Set());
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('LEARNER');

    useEffect(() => {
        void loadAssessments();
    }, []);

    const loadAssessments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAssessments();
            setAssessments(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        const token = getStoredAccessToken();
        if (!token) {
            setUsersError('Not authenticated. Please log in again.');
            return;
        }
        try {
            setUsersLoading(true);
            setUsersError(null);
            const data = await fetchUsers(token);
            setUsers(data);
            const pairs = new Set<string>();
            for (const user of data) {
                for (const assessmentId of user.enrolled_assessments ?? []) {
                    pairs.add(`${user.id}:${assessmentId}`);
                }
            }
            setEnrolledPairs(pairs);
        } catch (err) {
            setUsersError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setUsersLoading(false);
        }
    };

    const handleToggleEnrollment = async (assessmentId: string) => {
        if (enrollingAssessmentId === assessmentId) {
            setEnrollingAssessmentId(null);
            return;
        }
        setEnrollingAssessmentId(assessmentId);
        if (users.length === 0) {
            await loadUsers();
        }
    };

    const handleEnroll = async (username: string, userId: string, assessmentId: string) => {
        const token = getStoredAccessToken();
        if (!token) return;
        try {
            setEnrollingUserId(userId);
            await enrollUserInAssessment(username, assessmentId, token);
            setEnrolledPairs(prev => new Set([...prev, `${userId}:${assessmentId}`]));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to enroll user');
        } finally {
            setEnrollingUserId(null);
        }
    };

    const handleUnenroll = async (username: string, userId: string, assessmentId: string) => {
        const token = getStoredAccessToken();
        if (!token) return;
        try {
            setEnrollingUserId(userId);
            await unenrollUserFromAssessment(username, assessmentId, token);
            setEnrolledPairs(prev => {
                const next = new Set(prev);
                next.delete(`${userId}:${assessmentId}`);
                return next;
            });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to unenroll user');
        } finally {
            setEnrollingUserId(null);
        }
    };

    const isEnrolled = (userId: string, assessmentId: string) =>
        enrolledPairs.has(`${userId}:${assessmentId}`);

    // Edit handlers
    const handleEditClick = (assessment: Assessment) => {
        setEnrollingAssessmentId(null);
        setEditingId(assessment.id);
        setEditFormData({
            problem_statement: assessment.problem_statement,
            deliverables: [...assessment.deliverables],
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditFormData({ problem_statement: '', deliverables: [] });
    };

    const handleDeliverableChange = (index: number, value: string) => {
        const newDeliverables = [...editFormData.deliverables];
        newDeliverables[index] = value;
        setEditFormData({ ...editFormData, deliverables: newDeliverables });
    };

    const handleAddDeliverable = () => {
        setEditFormData({
            ...editFormData,
            deliverables: [...editFormData.deliverables, ''],
        });
    };

    const handleRemoveDeliverable = (index: number) => {
        const newDeliverables = editFormData.deliverables.filter((_, i) => i !== index);
        setEditFormData({ ...editFormData, deliverables: newDeliverables });
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            setIsSaving(true);
            await updateAssessment(editingId, editFormData);
            setAssessments(
                assessments.map(a =>
                    a.id === editingId
                        ? { ...a, problem_statement: editFormData.problem_statement, deliverables: editFormData.deliverables }
                        : a
                )
            );
            setEditingId(null);
            setEditFormData({ problem_statement: '', deliverables: [] });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save assessment');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.container}><p>Loading assessments...</p></div>;
    }

    if (error) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>Error: {error}</p>
                <button onClick={() => void loadAssessments()} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    if (assessments.length === 0) {
        return <div className={styles.container}><p>No assessments found.</p></div>;
    }

    const visibleUsers =
        roleFilter === 'LEARNER' ? users.filter(u => u.role === 'LEARNER') : users;

    return (
        <div className={styles.container}>
            <h1>Assessments</h1>
            <div className={styles.assessmentGrid}>
                {assessments.map(assessment => (
                    <div key={assessment.id} className={styles.assessmentCard}>
                        <h3>{assessment.id}</h3>

                        {editingId === assessment.id ? (
                            <div className={styles.editForm}>
                                <div className={styles.formGroup}>
                                    <label>Scenario</label>
                                    <textarea
                                        value={editFormData.problem_statement}
                                        onChange={e =>
                                            setEditFormData({ ...editFormData, problem_statement: e.target.value })
                                        }
                                        className={styles.textarea}
                                        rows={4}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Deliverables</label>
                                    <div className={styles.deliverablesList}>
                                        {editFormData.deliverables.map((deliverable, index) => (
                                            <div key={index} className={styles.deliverableInput}>
                                                <input
                                                    type="text"
                                                    value={deliverable}
                                                    onChange={e => handleDeliverableChange(index, e.target.value)}
                                                    placeholder="Enter deliverable"
                                                    className={styles.input}
                                                />
                                                {editFormData.deliverables.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDeliverable(index)}
                                                        className={styles.removeButton}
                                                        title="Remove deliverable"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddDeliverable}
                                        className={styles.addButton}
                                    >
                                        + Add Deliverable
                                    </button>
                                </div>

                                <div className={styles.buttonGroup}>
                                    <button onClick={handleSave} disabled={isSaving} className={styles.saveButton}>
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={handleCancel} disabled={isSaving} className={styles.cancelButton}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.boxesContainer}>
                                    <div className={styles.box}>
                                        <h4>Scenario</h4>
                                        <p>{assessment.problem_statement}</p>
                                    </div>
                                    <div className={styles.box}>
                                        <h4>Deliverables</h4>
                                        <ul>
                                            {assessment.deliverables.map((d, i) => (
                                                <li key={i}>{d}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className={styles.cardActions}>
                                    <button
                                        onClick={() => handleEditClick(assessment)}
                                        className={styles.editButton}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => void handleToggleEnrollment(assessment.id)}
                                        className={
                                            enrollingAssessmentId === assessment.id
                                                ? `${styles.enrollToggleBtn} ${styles.enrollToggleBtnActive}`
                                                : styles.enrollToggleBtn
                                        }
                                    >
                                        {enrollingAssessmentId === assessment.id
                                            ? 'Close Enrollment'
                                            : 'Manage Enrollment'}
                                    </button>
                                </div>

                                {/* Enrollment panel */}
                                {enrollingAssessmentId === assessment.id && (
                                    <div className={styles.enrollmentPanel}>
                                        <div className={styles.enrollmentPanelHeader}>
                                            <h4 className={styles.enrollmentPanelTitle}>
                                                User Enrollment
                                            </h4>
                                            <div className={styles.filterRow}>
                                                {(['LEARNER', 'ALL'] as const).map(f => (
                                                    <button
                                                        key={f}
                                                        type="button"
                                                        className={
                                                            roleFilter === f
                                                                ? `${styles.filterBtn} ${styles.filterBtnActive}`
                                                                : styles.filterBtn
                                                        }
                                                        onClick={() => setRoleFilter(f)}
                                                    >
                                                        {f === 'LEARNER' ? 'Learners Only' : 'All Users'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {usersLoading ? (
                                            <p className={styles.enrollmentLoading}>Loading users...</p>
                                        ) : usersError ? (
                                            <div>
                                                <p className={styles.enrollmentError}>{usersError}</p>
                                                <button
                                                    className={styles.retryButton}
                                                    onClick={() => void loadUsers()}
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        ) : visibleUsers.length === 0 ? (
                                            <p className={styles.noUsers}>No users found.</p>
                                        ) : (
                                            <div className={styles.userList}>
                                                {visibleUsers.map(user => (
                                                    <div key={user.id} className={styles.userRow}>
                                                        <div className={styles.userAvatar}>
                                                            {(user.full_name || user.username)
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className={styles.userInfo}>
                                                            <p className={styles.userName}>
                                                                {user.full_name || user.username}
                                                            </p>
                                                            <p className={styles.userEmail}>
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`${styles.roleBadge} ${styles[`roleBadge${user.role}`]}`}
                                                        >
                                                            {user.role}
                                                        </span>
                                                        {isEnrolled(user.id, assessment.id) ? (
                                                            <div className={styles.enrolledActions}>
                                                                <span className={styles.enrolledBadge}>
                                                                    Enrolled ✓
                                                                </span>
                                                                <button
                                                                    className={styles.unenrollActionBtn}
                                                                    disabled={enrollingUserId === user.id}
                                                                    onClick={() =>
                                                                        void handleUnenroll(
                                                                            user.username,
                                                                            user.id,
                                                                            assessment.id
                                                                        )
                                                                    }
                                                                >
                                                                    {enrollingUserId === user.id
                                                                        ? '...'
                                                                        : 'Unenroll'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className={styles.enrollActionBtn}
                                                                disabled={enrollingUserId === user.id}
                                                                onClick={() =>
                                                                    void handleEnroll(
                                                                        user.username,
                                                                        user.id,
                                                                        assessment.id
                                                                    )
                                                                }
                                                            >
                                                                {enrollingUserId === user.id
                                                                    ? '...'
                                                                    : 'Enroll'}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
