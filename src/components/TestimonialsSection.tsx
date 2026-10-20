"use client";

import React from "react";
import { Quote } from "lucide-react";

export interface TestimonialItem {
  id: string;
  client_name: string;
  shoot_type: string;
  quote: string;
  image_url?: string | null;
}

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  enabled?: boolean;
}

export default function TestimonialsSection({
  testimonials,
  enabled = true,
}: TestimonialsSectionProps) {
  if (!enabled || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <span className="section-eyebrow">WORDS OF APPRECIATION</span>
          <h2 className="section-title">Kind Words from Real Couples</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card">
              <Quote size={28} className="quote-icon" />
              <p className="quote-text">“{item.quote}”</p>
              <div className="client-info">
                <span className="client-name">{item.client_name}</span>
                <span className="shoot-tag">{item.shoot_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          padding: clamp(5rem, 8vw, 8.5rem) 0;
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .testimonials-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto clamp(3rem, 5vw, 4.5rem);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent-gold);
        }

        .section-title {
          font-size: clamp(2.25rem, 4vw, 3.25rem);
          line-height: 1.15;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: clamp(1.75rem, 3.5vw, 3rem);
        }

        .testimonial-card {
          background-color: var(--bg-surface);
          padding: clamp(2rem, 4vw, 2.75rem);
          border: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        :global(.quote-icon) {
          color: var(--accent-gold);
          margin-bottom: 1.25rem;
          opacity: 0.8;
        }

        .quote-text {
          font-family: var(--font-serif);
          font-size: 1.1875rem;
          font-style: italic;
          line-height: 1.7;
          color: var(--text-primary);
          margin-bottom: 1.75rem;
          flex: 1;
        }

        .client-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.25rem;
        }

        .client-name {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 0.04em;
        }

        .shoot-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        @media (max-width: 640px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
