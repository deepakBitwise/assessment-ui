'use client';

import { useEffect, useState } from 'react';
import { fetchSubmissions, fetchSubmission, getPresignedDownloadUrl } from '@/lib/api';
import type { Submission, SubmissionDetail, SubmissionStatus } from '@/types/assessment';

type SubmissionWithFile = SubmissionDetail & {
  attachment_object_name?: string | null;
};

type StatusFilter = 'ALL' | SubmissionStatus;

function overallStatus(
  s: Pick<Submission, 'automated_check' | 'llm_judge' | 'human_reviewer'>
): SubmissionStatus {
  if (
    s.automated_check === 'REJECTED' ||
    s.llm_judge === 'REJECTED' ||
    s.human_reviewer === 'REJECTED'
  ) {
    return 'REJECTED';
  }
  if (
    s.automated_check === 'PASSED' &&
    s.llm_judge === 'PASSED' &&
    s.human_reviewer === 'PASSED'
  ) {
    return 'PASSED';
  }
  return 'PENDING';
}

function statusCls(status: SubmissionStatus): string {
  if (status === 'PASSED') return 'status passed';
  if (status === 'REJECTED') return 'status failed';
  return 'status pending';
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function SubmissionsPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [selected, setSelected] = useState<SubmissionWithFile | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSubmissions();
      setSubmissions(data);
      if (data.length > 0) {
        void loadDetail(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    try {
      setLoadingDetail(true);
      const detail = (await fetchSubmission(id)) as SubmissionWithFile;
      setSelected(detail);
    } catch (err) {
      console.error('Submission detail error:', err);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function downloadFile() {
    if (!selected?.attachment_object_name) {
      alert('No file attached to this submission');
      return;
    }
    try {
      setDownloading(true);
      const url = await getPresignedDownloadUrl(selected.attachment_object_name);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const counts = {
    ALL: submissions.length,
    PASSED: submissions.filter(s => overallStatus(s) === 'PASSED').length,
    PENDING: submissions.filter(s => overallStatus(s) === 'PENDING').length,
    REJECTED: submissions.filter(s => overallStatus(s) === 'REJECTED').length,
  };

  const filtered =
    filter === 'ALL' ? submissions : submissions.filter(s => overallStatus(s) === filter);

  if (loading) {
    return (
      <div className="panel" style={{ padding: '2rem' }}>
        <p className="eyebrow">Loading</p>
        <h2>Fetching Submissions…</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{ padding: '2rem' }}>
        <p className="eyebrow">Error</p>
        <h2 style={{ color: 'var(--coral)' }}>Failed to Load</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>{error}</p>
        <button className="button button--primary" onClick={() => void load()}>
          Retry
        </button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="panel" style={{ padding: '2rem' }}>
        <p className="eyebrow">Submissions</p>
        <h2>No Submissions Found</h2>
        <p style={{ color: 'var(--muted)' }}>No learner submissions exist yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary header */}
      <div className="reviewer-hero">
        <div className="hero__copy">
          <p className="eyebrow">Admin Console</p>
          <h1>All Submissions</h1>
          <p style={{ color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            View, inspect, and download every learner submission across all assessments.
          </p>
        </div>
        <div className="panel">
          <p className="eyebrow">Queue Summary</p>
          <h2>{submissions.length} Total</h2>
          <p className="spotlight-panel__summary">
            Passed: {counts.PASSED} &nbsp;·&nbsp; Pending: {counts.PENDING} &nbsp;·&nbsp; Rejected:{' '}
            {counts.REJECTED}
          </p>
        </div>
      </div>

      {/* List + Detail */}
      <section className="layout-grid layout-grid--bottom">
        {/* LEFT — queue */}
        <div className="panel reviewer-queue-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Submission Queue</p>
              <h2>Submissions</h2>
            </div>
            <button
              type="button"
              className="button button--ghost"
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              onClick={() => void load()}
            >
              Refresh
            </button>
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {(['ALL', 'PENDING', 'PASSED', 'REJECTED'] as const).map(f => (
              <button
                key={f}
                type="button"
                className={filter === f ? 'button button--primary' : 'button button--ghost'}
                style={{ fontSize: '0.76rem', padding: '7px 13px' }}
                onClick={() => setFilter(f)}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          <div className="reviewer-queue">
            {filtered.map(sub => {
              const verdict = overallStatus(sub);
              return (
                <button
                  key={sub.id}
                  type="button"
                  className={`queue-item${selected?.id === sub.id ? ' queue-item--active' : ''}`}
                  style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => void loadDetail(sub.id)}
                >
                  <div className="queue-item__head">
                    <strong style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>
                      {shortId(sub.id)}
                    </strong>
                    <span className={statusCls(verdict)}>{verdict}</span>
                  </div>
                  <p>
                    User:{' '}
                    {sub.user_id.length > 28
                      ? sub.user_id.slice(0, 28) + '…'
                      : sub.user_id}
                  </p>
                  <p>
                    Assessment:{' '}
                    {sub.assessment_id.length > 24
                      ? sub.assessment_id.slice(0, 24) + '…'
                      : sub.assessment_id}
                  </p>
                  <span className="queue-item__link">
                    {new Date(sub.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="brief-card">
                <p className="eyebrow">No Results</p>
                <p>
                  No{filter !== 'ALL' ? ` ${filter.toLowerCase()}` : ''} submissions found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — detail */}
        {selected && (
          <div className="panel reviewer-detail-panel">
            {loadingDetail ? (
              <p style={{ color: 'var(--muted)' }}>Loading details…</p>
            ) : (
              <>
                {/* Header */}
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Submission Detail</p>
                    <h2
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        marginTop: '6px',
                        letterSpacing: '0.02em',
                        wordBreak: 'break-all',
                      }}
                    >
                      {selected.id}
                    </h2>
                  </div>
                  <span className={statusCls(overallStatus(selected))}>
                    {overallStatus(selected)}
                  </span>
                </div>

                {/* IDs & Timestamps */}
                <div className="reviewer-detail-grid" style={{ marginBottom: '16px' }}>
                  <div className="detail-stat">
                    <span>User ID</span>
                    <strong
                      style={{ wordBreak: 'break-all', fontSize: '0.82rem', fontFamily: 'monospace' }}
                    >
                      {selected.user_id}
                    </strong>
                  </div>
                  <div className="detail-stat">
                    <span>Assessment ID</span>
                    <strong
                      style={{ wordBreak: 'break-all', fontSize: '0.82rem', fontFamily: 'monospace' }}
                    >
                      {selected.assessment_id}
                    </strong>
                  </div>
                  <div className="detail-stat">
                    <span>Submitted At</span>
                    <strong>{fmtDate(selected.created_at)}</strong>
                  </div>
                  <div className="detail-stat">
                    <span>Last Updated</span>
                    <strong>{fmtDate(selected.updated_at)}</strong>
                  </div>
                </div>

                {/* Evaluation pipeline */}
                <div className="brief-card" style={{ marginBottom: '16px' }}>
                  <p className="eyebrow">Evaluation Pipeline</p>
                  <div className="reviewer-detail-grid" style={{ marginTop: '14px' }}>
                    <div className="detail-stat">
                      <span>Automated Check</span>
                      <span className={statusCls(selected.automated_check)}>
                        {selected.automated_check}
                      </span>
                    </div>
                    <div className="detail-stat">
                      <span>LLM Judge</span>
                      <span className={statusCls(selected.llm_judge)}>
                        {selected.llm_judge}
                      </span>
                    </div>
                    <div className="detail-stat">
                      <span>Human Reviewer</span>
                      <span className={statusCls(selected.human_reviewer)}>
                        {selected.human_reviewer}
                      </span>
                    </div>
                    <div className="detail-stat">
                      <span>Overall Verdict</span>
                      <span className={statusCls(overallStatus(selected))}>
                        {overallStatus(selected)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File download */}
                <div className="brief-card brief-card--accent">
                  <p className="eyebrow">Submitted File</p>
                  {selected.attachment_object_name ? (
                    <>
                      <p
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          wordBreak: 'break-all',
                          color: 'var(--muted)',
                          marginTop: '10px',
                        }}
                      >
                        {selected.attachment_object_name}
                      </p>
                      <button
                        className="button button--primary"
                        onClick={() => void downloadFile()}
                        disabled={downloading}
                        style={{ marginTop: '14px' }}
                      >
                        {downloading ? 'Preparing…' : 'Download Submission File'}
                      </button>
                    </>
                  ) : (
                    <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
                      No file attached to this submission.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}
