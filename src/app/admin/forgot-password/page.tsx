"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { KeyRound, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevToken(null);
    setDevNote(null);

    if (!email.trim()) {
      setError("Please enter your administrator email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process reset request.");
      }

      setMessage(data.message || "If an administrator account with that email exists, reset instructions have been dispatched.");
      if (data.devToken) {
        setDevToken(data.devToken);
      }
      if (data.devNote) {
        setDevNote(data.devNote);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error requesting password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      <div className="login-card">
        <NextLink href="/admin/login" className="login-back-link">
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </NextLink>

        <div className="login-header">
          <div className="lock-icon-badge">
            <KeyRound size={26} />
          </div>
          <span className="login-eyebrow">PASSWORD RECOVERY</span>
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">
            Enter your administrator email to receive secure single-use recovery instructions.
          </p>
        </div>

        {error && (
          <div className="alert-box alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <p className="alert-text">{error}</p>
          </div>
        )}

        {message ? (
          <div className="alert-box alert-success" role="alert">
            <CheckCircle2 size={22} className="alert-icon" />
            <div className="alert-body">
              <p className="alert-text">{message}</p>

              {devToken && (
                <div className="dev-token-box">
                  <p><strong>Dev/Testing Mode Active:</strong> Since SMTP is not yet configured, your single-use reset link is provided below:</p>
                  <NextLink
                    href={`/admin/reset-password?token=${devToken}`}
                    className="dev-reset-btn"
                  >
                    Open Reset Screen with Token
                  </NextLink>
                  {devNote && <small className="dev-note">{devNote}</small>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="recovery-email" className="form-label">
                Registered Admin Email
              </label>
              <input
                id="recovery-email"
                type="email"
                required
                placeholder="admin@snehasishphotography.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary login-btn"
            >
              <span>{loading ? "Verifying..." : "Dispatch Reset Instructions"}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .login-viewport {
          min-height: 100vh;
          background: linear-gradient(180deg, #03111B 0%, #020C13 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: clamp(2rem, 5vw, 3rem);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
        }

        .login-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }

        .login-back-link:hover {
          color: var(--text-primary);
        }

        .login-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .lock-icon-badge {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(216, 186, 132, 0.12);
          border: 1px solid rgba(216, 186, 132, 0.3);
          color: var(--accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .login-eyebrow {
          font-size: 0.6875rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent-gold);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .login-title {
          font-family: var(--font-sans);
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
        }

        .login-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .form-input {
          width: 100%;
          background-color: #061824;
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 0.85rem 1rem;
          font-family: inherit;
          font-size: 0.9375rem;
          border-radius: 2px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .form-input:focus {
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 1px var(--accent-gold);
          background-color: #041420;
        }

        .login-btn {
          width: 100%;
          padding: 1.05rem;
          margin-top: 0.5rem;
          background-color: var(--accent-gold);
          border-color: var(--accent-gold);
          color: #03111B;
          font-weight: 600;
          cursor: pointer;
        }

        .login-btn:hover {
          background-color: var(--accent-gold-hover);
          border-color: var(--accent-gold-hover);
        }

        .alert-box {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }

        .alert-error {
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          color: #E57373;
        }

        .alert-success {
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          color: #81C784;
        }

        .alert-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .alert-text {
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .dev-token-box {
          background: #061824;
          border: 1px solid var(--border-subtle);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-top: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .dev-reset-btn {
          display: inline-block;
          background: var(--accent-gold);
          color: #03111B;
          padding: 0.6rem 1rem;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-radius: 2px;
        }

        .dev-reset-btn:hover {
          background: var(--accent-gold-hover);
        }

        .dev-note {
          color: var(--text-muted);
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
}
