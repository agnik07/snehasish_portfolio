"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Lock, ArrowRight, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your administrator email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Successful login
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      <div className="login-card">
        {/* Back Link */}
        <NextLink href="/" className="login-back-link">
          <ArrowLeft size={14} />
          <span>Return to Public Portfolio</span>
        </NextLink>

        <div className="login-header">
          <div className="lock-icon-badge">
            <ShieldCheck size={26} />
          </div>
          <span className="login-eyebrow">RESTRICTED ACCESS</span>
          <h1 className="login-title">Photographer Portal</h1>
          <p className="login-subtitle">
            Authenticated studio administration for Snehasish Dutta.
          </p>
        </div>

        {error && (
          <div className="alert-box alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <p className="alert-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="admin-email" className="form-label">
              Admin Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              placeholder="admin@snehasishphotography.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="admin-password" className="form-label">
                Password
              </label>
              <NextLink href="/admin/forgot-password" className="forgot-link">
                Forgot Password?
              </NextLink>
            </div>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="initial-credentials-tip">
            <small>
              🔑 <strong>Initial Admin Account:</strong> <code>admin@snehasishphotography.com</code> / <code>Snehasish@2026!</code> (or configured via environment variables).
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary login-btn"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-viewport {
          min-height: 100vh;
          background: linear-gradient(180deg, #181615 0%, #121110 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          color: #FAF8F5;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          background-color: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: clamp(2rem, 5vw, 3rem);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        }

        .login-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8A857D;
          text-decoration: none;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }

        .login-back-link:hover {
          color: #FAF8F5;
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
          background: rgba(181, 142, 78, 0.12);
          border: 1px solid rgba(181, 142, 78, 0.35);
          color: var(--accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .login-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent-gold);
          margin-bottom: 0.5rem;
        }

        .login-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: #FAF8F5;
          margin-bottom: 0.4rem;
        }

        .login-subtitle {
          font-size: 0.875rem;
          color: #A39E96;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .forgot-link {
          font-size: 0.75rem;
          color: var(--accent-gold);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .forgot-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .login-card :global(.form-label) {
          color: #D2CABE;
        }

        .login-card :global(.form-input) {
          background-color: #161514;
          border-color: rgba(255, 255, 255, 0.15);
          color: #FAF8F5;
        }

        .login-card :global(.form-input:focus) {
          border-color: var(--accent-gold);
          background-color: #121110;
        }

        .initial-credentials-tip {
          background: rgba(181, 142, 78, 0.08);
          border: 1px solid rgba(181, 142, 78, 0.25);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: #D2CABE;
          line-height: 1.5;
        }

        .initial-credentials-tip code {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
          color: #FAF8F5;
        }

        .login-btn {
          width: 100%;
          padding: 1.05rem;
          margin-top: 0.5rem;
          background-color: var(--accent-gold);
          border-color: var(--accent-gold);
          color: #FFFFFF;
        }

        .login-btn:hover {
          background-color: var(--accent-gold-hover);
          border-color: var(--accent-gold-hover);
        }

        .alert-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(155, 59, 59, 0.15);
          border: 1px solid rgba(155, 59, 59, 0.35);
          color: #F8B4B4;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
