"use client";

import React from "react";
import { ArrowDown, ArrowRight } from "lucide-react";

interface HeroProps {
  photographerName?: string;
  tagline?: string;
  dominantPhotoUrl?: string;
  supportingPhotoUrl?: string;
}

export default function Hero({
  photographerName = "SNEHASISH DUTTA",
  tagline = "Fine Art & Destination Wedding Storyteller Documenting Authentic Human Connection.",
  dominantPhotoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85",
  supportingPhotoUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
}: HeroProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="asymmetric-hero" aria-label="Introduction">
      <div className="container hero-container">
        {/* Left Column: Supporting Image (top) & Oversized Name (bottom-left) */}
        <div className="hero-left-col">
          {/* Supporting small photograph */}
          <div className="supporting-img-box">
            <img
              src={supportingPhotoUrl}
              alt="Destination ceremony detail"
              className="supporting-img"
              loading="eager"
            />
            <span className="photo-tag-minimal">CEREMONY &bull; ARCHIVE</span>
          </div>

          {/* Bottom Left Oversized Typography Block */}
          <div className="hero-title-block">
            <span className="hero-kicker">PORTFOLIO &bull; 2026</span>
            <h1 className="hero-display-name">{photographerName}</h1>
            <p className="hero-tagline">{tagline}</p>

            <div className="hero-cta-actions">
              <button
                type="button"
                onClick={() => scrollTo("work")}
                className="btn-outline hero-action-btn"
              >
                <span>View Selected Work</span>
                <ArrowDown size={14} />
              </button>

              <button
                type="button"
                onClick={() => scrollTo("quote")}
                className="btn-primary btn-quote hero-action-btn"
              >
                <span>Get a Quote</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dominant Portrait Photograph */}
        <div className="hero-right-col">
          <div className="dominant-img-box">
            <img
              src={dominantPhotoUrl}
              alt={`${photographerName} Featured Portraiture`}
              className="dominant-img"
              loading="eager"
            />
            <div className="dominant-overlay" />
            <span className="dominant-label">PORTRAITURE &bull; INTIMACY</span>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <button
        type="button"
        onClick={() => scrollTo("work")}
        className="minimal-scroll-indicator"
        aria-label="Scroll down to work"
      >
        <span className="scroll-label">SCROLL</span>
        <div className="scroll-track">
          <div className="scroll-bar" />
        </div>
      </button>

      <style jsx>{`
        .asymmetric-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: calc(var(--header-height) + 1.5rem);
          padding-bottom: 5rem;
          background-color: var(--bg-primary);
          overflow: hidden;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: clamp(2rem, 5vw, 5.5rem);
          align-items: flex-end;
          min-height: calc(100vh - var(--header-height) - 4rem);
        }

        /* Left Column */
        .hero-left-col {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 520px;
        }

        .supporting-img-box {
          position: relative;
          width: clamp(220px, 32vw, 360px);
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          margin-bottom: 2.5rem;
        }

        .supporting-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.92);
          transition: transform 0.8s var(--ease-editorial);
        }

        .supporting-img-box:hover .supporting-img {
          transform: scale(1.04);
        }

        .photo-tag-minimal {
          position: absolute;
          bottom: 0.65rem;
          left: 0.75rem;
          font-family: var(--font-sans);
          font-size: 0.625rem;
          letter-spacing: 0.16em;
          color: #FAF8F5;
          background: rgba(3, 17, 27, 0.75);
          backdrop-filter: blur(8px);
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
        }

        .hero-title-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-top: auto;
        }

        .hero-kicker {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--accent-gold);
          font-weight: 600;
          margin-bottom: 0.85rem;
        }

        .hero-display-name {
          font-family: var(--font-sans);
          font-size: clamp(2.75rem, 6.8vw, 6.25rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.04em;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .hero-tagline {
          font-size: clamp(1rem, 1.6vw, 1.25rem);
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 580px;
          margin-bottom: 2.5rem;
          font-weight: 400;
        }

        .hero-cta-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .hero-action-btn {
          padding: 0.9rem 2rem;
        }

        /* Right Column (Dominant Portrait) */
        .hero-right-col {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          height: 100%;
        }

        .dominant-img-box {
          position: relative;
          width: 100%;
          max-width: 560px;
          aspect-ratio: 4 / 5.4;
          overflow: hidden;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .dominant-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          transition: transform 0.9s var(--ease-editorial);
        }

        .dominant-img-box:hover .dominant-img {
          transform: scale(1.03);
        }

        .dominant-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 65%,
            rgba(3, 17, 27, 0.75) 100%
          );
          pointer-events: none;
        }

        .dominant-label {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #FAF8F5;
          background: rgba(3, 17, 27, 0.8);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.85rem;
          border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Scroll guidance */
        .minimal-scroll-indicator {
          position: absolute;
          bottom: 2rem;
          right: clamp(1.25rem, 4vw, 4rem);
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s;
        }

        .minimal-scroll-indicator:hover {
          color: var(--text-primary);
        }

        .scroll-label {
          font-family: var(--font-sans);
          font-size: 0.625rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .scroll-track {
          width: 32px;
          height: 1px;
          background: rgba(247, 247, 245, 0.2);
          position: relative;
          overflow: hidden;
        }

        .scroll-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 14px;
          background-color: var(--accent-gold);
          animation: slideBar 1.8s ease-in-out infinite;
        }

        @keyframes slideBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(250%);
          }
        }

        @media (max-width: 960px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .hero-left-col {
            min-height: auto;
          }
          .supporting-img-box {
            display: none;
          }
          .hero-right-col {
            justify-content: flex-start;
          }
          .dominant-img-box {
            max-width: 100%;
            aspect-ratio: 4 / 4.5;
          }
          .minimal-scroll-indicator {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
