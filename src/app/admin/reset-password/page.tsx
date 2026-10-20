"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("No reset token provided. Please use the link sent to your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="lock-icon-badge">
          <Lock size={26} />
        </div>
        <span className="login-eyebrow">CREDENTIAL UPDATE</span>
        <h1 className="login-title">Set New Password</h1>
        <p className="login-subtitle">
          Choose a strong, secure passphrase for your administrator account.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-error" role="alert">
          <AlertCircle size={18} className="alert-icon" />
          <p className="alert-text">{error}</p>
        </div>
      )}

      {success ? (
        <div className="alert-box alert-success" role="alert">
          <CheckCircle2 size={24} className="alert-icon" />
          <div className="alert-body">
            <h4 className="success-heading">Password Successfully Updated</h4>
            <p className="alert-text">
              Your new password is now active. You may proceed to log in to the administrator dashboard.
            </p>
            <NextLink href="/admin/login" className="btn-primary login-btn">
              <span>Go to Sign In</span>
              <ArrowRight size={14} />
            </NextLink>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">
              New Password (min. 8 characters)
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary login-btn"
          >
            <span>{loading ? "Updating Password..." : "Save New Password"}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      )}

      <style jsx>{`
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

        .success-heading {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .alert-text {
          font-size: 0.875rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="login-viewport">
      <Suspense fallback={<div className="login-loading">Loading reset portal...</div>}>
        <ResetPasswordForm />
      </Suspense>

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

        .login-loading {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
