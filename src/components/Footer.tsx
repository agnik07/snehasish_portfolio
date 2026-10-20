"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { Lock, Mail, ArrowUp } from "lucide-react";
import LegalModal from "./LegalModal";

interface FooterProps {
  brandName?: string;
  tagline?: string;
  contactEmail?: string;
  whatsappPhone?: string;
  instagramUrl?: string;
  privacyText?: string;
  termsText?: string;
}

export default function Footer({
  brandName = "SNEHASISH DUTTA",
  tagline = "Fine Art & Documentary Wedding Storyteller",
  contactEmail = "contact@snehasishphotography.com",
  whatsappPhone = "+91 98765 43210",
  instagramUrl = "https://instagram.com",
  privacyText,
  termsText,
}: FooterProps) {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="minimal-editorial-footer">
        <div className="container">
          <div className="footer-main-grid">
            {/* Brand Column */}
            <div className="footer-col-brand">
              <button type="button" onClick={scrollToTop} className="footer-brand-title">
                {brandName}
              </button>
              <p className="footer-tagline-text">{tagline}</p>
              <p className="footer-coverage-note">
                Documenting quiet intimacy, grand ceremonies, and authentic moments worldwide.
              </p>
            </div>

            {/* Streamlined Navigation Column */}
            <div className="footer-col-nav">
              <span className="footer-col-kicker">Navigation</span>
              <ul className="footer-nav-list">
                <li>
                  <button type="button" onClick={() => scrollTo("work")} className="footer-nav-btn">
                    Work
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo("about")} className="footer-nav-btn">
                    About
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo("contact")} className="footer-nav-btn">
                    Contact
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo("quote")} className="footer-nav-btn gold-link">
                    Get a Quote
                  </button>
                </li>
              </ul>
            </div>

            {/* Direct Inquiries & Social */}
            <div className="footer-col-contact">
              <span className="footer-col-kicker">Direct Inquiries</span>
              <div className="footer-contact-actions">
                <a href={`mailto:${contactEmail}`} className="footer-email-link">
                  <Mail size={15} />
                  <span>{contactEmail}</span>
                </a>
                {whatsappPhone && (
                  <span className="footer-phone-text">WhatsApp: {whatsappPhone}</span>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label="Instagram Profile"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>@snehasish.photography</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Legal, Admin */}
          <div className="footer-bottom-bar">
            <span className="copyright-note">
              &copy; {currentYear} {brandName}. All rights reserved.
            </span>

            <div className="legal-and-admin">
              <button
                type="button"
                className="legal-trigger"
                onClick={() => setModalType("privacy")}
              >
                Privacy
              </button>
              <span className="dot-sep">&bull;</span>
              <button
                type="button"
                className="legal-trigger"
                onClick={() => setModalType("terms")}
              >
                Terms
              </button>
              <span className="dot-sep">&bull;</span>
              <NextLink href="/admin/login" className="admin-portal-link" title="Photographer Administration Portal">
                <Lock size={11} />
                <span>Admin Login</span>
              </NextLink>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="scroll-top-btn"
              aria-label="Back to top"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {modalType && (
        <LegalModal
          type={modalType}
          isOpen={true}
          onClose={() => setModalType(null)}
          customText={modalType === "privacy" ? privacyText : termsText}
        />
      )}

      <style jsx>{`
        .minimal-editorial-footer {
          background-color: #020C13;
          border-top: 1px solid var(--border-subtle);
          padding: clamp(4.5rem, 7vw, 6.5rem) 0 2.5rem;
          color: var(--text-primary);
        }

        .footer-main-grid {
          display: grid;
          grid-template-columns: 5fr 3fr 4fr;
          gap: clamp(2.5rem, 5vw, 5rem);
          padding-bottom: 3.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .footer-col-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-brand-title {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-sans);
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          transition: color 0.2s;
        }

        .footer-brand-title:hover {
          color: var(--accent-gold);
        }

        .footer-tagline-text {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .footer-coverage-note {
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .footer-col-kicker {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent-gold);
          font-weight: 600;
          display: block;
          margin-bottom: 1.25rem;
        }

        .footer-nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .footer-nav-btn {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s, transform 0.2s;
          text-align: left;
        }

        .footer-nav-btn:hover {
          color: var(--text-primary);
          transform: translateX(3px);
        }

        .gold-link {
          color: var(--accent-gold);
          font-weight: 500;
        }

        .footer-contact-actions {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .footer-email-link,
        .footer-social-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-email-link:hover,
        .footer-social-btn:hover {
          color: var(--text-primary);
        }

        .footer-phone-text {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        /* Bottom Bar */
        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .copyright-note {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .legal-and-admin {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .legal-trigger {
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s;
        }

        .legal-trigger:hover {
          color: var(--text-primary);
        }

        .dot-sep {
          color: rgba(255, 255, 255, 0.15);
          font-size: 0.625rem;
        }

        .admin-portal-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          border: 1px solid transparent;
        }

        .admin-portal-link:hover {
          color: var(--accent-gold);
          border-color: rgba(216, 186, 132, 0.2);
          background-color: rgba(216, 186, 132, 0.05);
        }

        .scroll-top-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
        }

        .scroll-top-btn:hover {
          background: var(--accent-gold);
          border-color: var(--accent-gold);
          color: #03111B;
          transform: translateY(-2px);
        }

        @media (max-width: 860px) {
          .footer-main-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .footer-bottom-bar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}
