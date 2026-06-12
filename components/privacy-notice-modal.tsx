"use client";

type PrivacyNoticeModalProps = {
  onAccept: () => void;
};

export function PrivacyNoticeModal({ onAccept }: PrivacyNoticeModalProps) {
  return (
    <div
      className="privacy-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
    >
      <div className="privacy-modal panel">
        <div className="privacy-modal__header">
          <div className="privacy-modal__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="eyebrow">Assessment Platform</p>
            <h2 id="privacy-title">Data Privacy &amp; Acceptable Use Notice</h2>
          </div>
        </div>

        <div className="privacy-modal__body">
          <p className="privacy-modal__lead">
            This assessment is intended solely for educational and evaluation purposes.
          </p>

          <ul className="privacy-modal__rules">
            <li>
              Participants must not upload, process, store, share, or expose any <strong>real personal data</strong>, customer data, employee information, confidential business information, or other sensitive information while completing this assessment.
            </li>
            <li>
              All workflows, repositories, documents, notifications, reports, and demonstrations must use <strong>synthetic, anonymized, or mock data</strong> created specifically for assessment purposes.
            </li>
          </ul>
        </div>

        <button className="button button--primary privacy-modal__cta" onClick={onAccept}>
          I Understand &amp; Continue
        </button>
      </div>
    </div>
  );
}
