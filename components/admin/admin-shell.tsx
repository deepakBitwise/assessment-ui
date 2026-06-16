'use client';

import { useState } from 'react';
import { AssessmentList } from './assessment-list';
import { SubmissionsPanel } from './submissions-panel';

type AdminTab = 'assessments' | 'submissions';

export function AdminShell() {
  const [tab, setTab] = useState<AdminTab>('assessments');

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
          padding: '18px 22px',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: '32px',
          background: 'rgba(255, 252, 247, 0.82)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 24px 80px rgba(27, 34, 33, 0.12)',
        }}
      >
        <span
          style={{
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontSize: '1rem',
            marginRight: 'auto',
          }}
        >
          Admin Console
        </span>
        <button
          className={tab === 'assessments' ? 'button button--primary' : 'button button--ghost'}
          style={{ fontSize: '0.88rem', padding: '10px 18px' }}
          onClick={() => setTab('assessments')}
        >
          Assessments
        </button>
        <button
          className={tab === 'submissions' ? 'button button--primary' : 'button button--ghost'}
          style={{ fontSize: '0.88rem', padding: '10px 18px' }}
          onClick={() => setTab('submissions')}
        >
          Submissions
        </button>
      </div>

      {tab === 'assessments' ? <AssessmentList /> : <SubmissionsPanel />}
    </>
  );
}
