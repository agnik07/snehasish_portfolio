"use client";

import React from "react";
import { ArrowRight, MapPin, Camera } from "lucide-react";

interface AboutSectionProps {
  photographerName?: string;
  biography?: string;
  photographyStyle?: string;
  serviceArea?: string;
  portraitUrl?: string;
}

export default function AboutSection({
  photographerName = "Snehasish Dutta",
  biography = "I am an independent destination wedding and portrait photographer documenting human connection across India and worldwide destinations. Rather than orchestrating artificial poses, I observe with quiet patience—capturing the unguarded glances, spontaneous laughter, and timeless emotions that occur naturally.",
  photographyStyle = "Documentary intimacy meets fine-art editorial composure. Working predominantly with natural ambient light, deep shadows, and truthful colors that remain timeless across generations.",
  serviceArea = "Based in India • Available Worldwide for Destination Assignments",
  portraitUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
}: AboutSectionProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const shootTypes = [
    "Wedding Celebrations",
    "Pre-Wedding Stories",
    "Post-Wedding Sessions",
    "Couple Portraits",
    "Individual Fine Art",
    "Private Events",
  ];

  return (
    <section id="about" className="about-section" aria-label="About the Photographer">
      <div className="container">
        <div className="about-grid">
          {/* Left: Photographer Portrait */}
          <div className="about-portrait-wrap">
            <div className="portrait-card">
              <img
                src={portraitUrl}
                alt={`${photographerName} - Photographer Portrait`}
                className="portrait-img"
                loading="lazy"
              />
              <div className="portrait-badge">
                <Camera size={14} />
                <span>The Photographer</span>
              </div>
            </div>
            <div className="service-area-pill">
              <MapPin size={14} className="gold-icon" />
              <span>{serviceArea}</span>
            </div>
          </div>

          {/* Right: Concise Personal Narrative */}
          <div className="about-content">
            <span className="section-eyebrow">ABOUT &bull; ARTISTIC PHILOSOPHY</span>
            <h2 className="section-heading about-title">
              Quiet Observation, Honest Moments
            </h2>

            <div className="about-bio-text">
              <p>{biography}</p>
            </div>

            <div className="style-note-card">
              <span className="style-label">The Photography Style:</span>
              <p className="style-text">{photographyStyle}</p>
            </div>

            {/* Shoots Accepted */}
            <div className="shoots-accepted-block">
              <span className="shoots-label">Photoshoot Disciplines:</span>
              <div className="shoot-tags-row">
                {shootTypes.map((type) => (
                  <span key={type} className="shoot-pill">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Simple Contact CTA */}
            <div className="about-cta-row">
              <button
                type="button"
                onClick={() => scrollTo("quote")}
                className="btn-primary btn-quote"
              >
                <span>Discuss a Photoshoot</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: clamp(6rem, 9vw, 9.5rem) 0;
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .about-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: center;
        }

        .about-portrait-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .portrait-card {
          position: relative;
          aspect-ratio: 4 / 5.2;
          overflow: hidden;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.4);
        }

        .portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(18%) contrast(102%);
          transition: transform 0.8s var(--ease-editorial);
        }

        .portrait-card:hover .portrait-img {
          transform: scale(1.025);
        }

        .portrait-badge {
          position: absolute;
          bottom: 1.25rem;
          left: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #FAF8F5;
          background: rgba(3, 17, 27, 0.82);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.85rem;
          border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .service-area-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          color: var(--text-secondary);
          padding: 0.75rem 1.25rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
        }

        :global(.gold-icon) {
          color: var(--accent-gold);
        }

        .about-content {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .about-title {
          font-size: clamp(2.25rem, 4.2vw, 3.5rem);
        }

        .about-bio-text p {
          font-size: 1.0625rem;
          line-height: 1.8;
          color: var(--text-secondary);
        }

        .style-note-card {
          padding: 1.5rem;
          background: var(--bg-surface);
          border-left: 2px solid var(--accent-gold);
          border-top: 1px solid var(--border-subtle);
          border-right: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .style-label {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-gold);
          font-weight: 600;
          display: block;
          margin-bottom: 0.4rem;
        }

        .style-text {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .shoots-accepted-block {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .shoots-label {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }

        .shoot-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .shoot-pill {
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          color: var(--text-secondary);
          background: var(--bg-surface);
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid var(--border-subtle);
        }

        .about-cta-row {
          margin-top: 0.5rem;
        }

        @media (max-width: 960px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
      `}</style>
    </section>
  );
}
