'use client';

import { useEffect, useState } from 'react';
import type { Assessment, AssessmentResponse, AssessmentUpdatePayload } from '@/types/assessment';
import { fetchAssessments, updateAssessment } from '@/lib/api';
import styles from './assessment-list.module.css';

export function AssessmentList() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<AssessmentUpdatePayload>({
        problem_statement: '',
        deliverables: [],
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadAssessments();
    }, []);

    const loadAssessments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAssessments();
            setAssessments(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load assessments');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (assessment: Assessment) => {
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

            // Update local state
            setAssessments(
                assessments.map((assessment) =>
                    assessment.id === editingId
                        ? {
                            ...assessment,
                            problem_statement: editFormData.problem_statement,
                            deliverables: editFormData.deliverables,
                        }
                        : assessment
                )
            );

            setEditingId(null);
            setEditFormData({ problem_statement: '', deliverables: [] });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save assessment');
            console.error('Error saving:', err);
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
                <button onClick={loadAssessments} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    if (assessments.length === 0) {
        return <div className={styles.container}><p>No assessments found.</p></div>;
    }

    return (
        <div className={styles.container}>
            <h1>Assessments</h1>
            <div className={styles.assessmentGrid}>
                {assessments.map((assessment) => (
                    <div key={assessment.id} className={styles.assessmentCard}>
                        <h3>{assessment.id}</h3>

                        {editingId === assessment.id ? (
                            <div className={styles.editForm}>
                                <div className={styles.formGroup}>
                                    <label>Scenario</label>
                                    <textarea
                                        value={editFormData.problem_statement}
                                        onChange={(e) =>
                                            setEditFormData({
                                                ...editFormData,
                                                problem_statement: e.target.value,
                                            })
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
                                                    onChange={(e) => handleDeliverableChange(index, e.target.value)}
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
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={styles.saveButton}
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className={styles.cancelButton}
                                    >
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
                                            {assessment.deliverables.map((deliverable, index) => (
                                                <li key={index}>{deliverable}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleEditClick(assessment)}
                                    className={styles.editButton}
                                >
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
