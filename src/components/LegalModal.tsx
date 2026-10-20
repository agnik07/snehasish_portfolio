"use client";

import React, { useEffect } from "react";
import { X, Shield, FileText } from "lucide-react";

interface LegalModalProps {
  type: "privacy" | "terms";
  isOpen: boolean;
  onClose: () => void;
  customText?: string;
}

export default function LegalModal({
  type,
  isOpen,
  onClose,
  customText,
}: LegalModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy & Client Confidentiality Policy" : "Booking Terms & Studio Policies";

  return (
    <div
      className="legal-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="legal-modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            {isPrivacy ? <Shield size={20} className="gold-accent" /> : <FileText size={20} className="gold-accent" />}
            <h3 id="legal-title" className="modal-title">{title}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {customText ? (
            <p className="legal-paragraph">{customText}</p>
          ) : isPrivacy ? (
            <div className="legal-content">
              <h4>1. Information We Collect</h4>
              <p>
                When you submit an inquiry through our booking form, we collect personal contact information such as your name, email address, phone number or WhatsApp handle, wedding/shoot date, event venue, and vision notes.
              </p>
              <h4>2. How We Use Your Data</h4>
              <p>
                All client information is used exclusively for evaluating date availability, preparing bespoke proposals, and coordinating shoots. We will never sell, rent, license, or exchange your personal information with any third party.
              </p>
              <h4>3. Image Publishing &amp; Client Consent</h4>
              <p>
                Photographs appearing on our public portfolio are published only with client consent. If you prefer your wedding or portrait session to remain completely private or confidential, we offer strict non-disclosure arrangements upon request.
              </p>
              <h4>4. Data Retention &amp; Rights</h4>
              <p>
                You may request a summary of the contact information we hold for you or ask for its permanent deletion from our database at any time by contacting contact@snehasishphotography.com.
              </p>
            </div>
          ) : (
            <div className="legal-content">
              <h4>1. Booking &amp; Date Reservation</h4>
              <p>
                Due to high demand during peak wedding and portrait seasons, calendar dates are reserved exclusively upon execution of a mutual photography agreement and receipt of an initial retainer deposit.
              </p>
              <h4>2. Gallery Delivery &amp; Archival</h4>
              <p>
                Full color-graded wedding galleries are delivered within 4 to 6 weeks following your celebration. A curated sneak-peek highlights gallery is delivered within 48 to 72 hours.
              </p>
              <h4>3. Travel &amp; Destination Arrangements</h4>
              <p>
                For destination assignments outside of Kolkata, travel (roundtrip airfare or ground transport) and accommodation for the photographer and associate team are coordinated transparently with the client.
              </p>
              <h4>4. Image Ownership &amp; Personal License</h4>
              <p>
                Clients receive full personal reproduction rights to share, print, and download all high-resolution delivered photographs for personal, non-commercial use.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary modal-close-btn-footer" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .legal-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 17, 16, 0.85);
          backdrop-filter: blur(10px);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: modalFadeIn 0.25s var(--ease-editorial);
        }

        .legal-modal-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-light);
          width: 100%;
          max-width: 680px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        :global(.gold-accent) {
          color: var(--accent-gold);
        }

        .modal-title {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          color: var(--text-primary);
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.2s;
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          color: var(--text-secondary);
          line-height: 1.75;
          font-size: 0.9375rem;
        }

        .legal-content h4 {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--text-primary);
          margin: 1.25rem 0 0.5rem;
        }

        .legal-content h4:first-child {
          margin-top: 0;
        }

        .legal-content p {
          margin-bottom: 1rem;
        }

        .legal-paragraph {
          white-space: pre-wrap;
        }

        .modal-footer {
          padding: 1.25rem 2rem;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
          background: var(--bg-primary);
        }

        .modal-close-btn-footer {
          padding: 0.65rem 1.8rem;
          font-size: 0.75rem;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
