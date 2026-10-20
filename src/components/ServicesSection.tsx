"use client";

import React from "react";
import NextLink from "next/link";
import { Check, ArrowRight } from "lucide-react";

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  starting_price?: string | null;
  cover_image_url?: string | null;
  inclusions: string[];
  order_index?: number;
}

interface ServicesSectionProps {
  services: ServiceItem[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section id="services" className="services-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="header-left">
            <span className="section-eyebrow">COMMISSIONS &amp; EXPERIENCES</span>
            <h2 className="section-title">Photography Offerings</h2>
          </div>
          <p className="section-description">
            Thoughtfully tailored documentation designed around the cadence of your celebrations. Every package is completely customizable.
          </p>
        </div>

        {/* Services Cards */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={service.id} className="service-card">
              {service.cover_image_url && (
                <div className="service-image-wrap">
                  <img
                    src={service.cover_image_url}
                    alt={service.name}
                    className="service-img"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                  <div className="service-overlay" />
                  <span className="service-num">0{index + 1}</span>
                </div>
              )}

              <div className="service-body">
                <h3 className="service-name">{service.name}</h3>
                <p className="service-desc">{service.description}</p>

                {/* Inclusions List */}
                {service.inclusions && service.inclusions.length > 0 && (
                  <div className="inclusions-block">
                    <span className="inclusions-label">Experience Highlights:</span>
                    <ul className="inclusions-list">
                      {service.inclusions.map((inc, i) => (
                        <li key={i} className="inclusion-item">
                          <Check size={14} className="check-icon" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Investment & CTA */}
                <div className="service-footer">
                  <div className="investment-tag">
                    <span className="inv-label">Investment</span>
                    <span className="inv-value">
                      {service.starting_price || "Inquire for Bespoke Quotation"}
                    </span>
                  </div>

                  <NextLink
                    href={`/contact?shoot_type=${encodeURIComponent(service.name)}`}
                    className="btn-primary service-cta"
                  >
                    <span>Inquire Now</span>
                    <ArrowRight size={14} />
                  </NextLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .services-section {
          padding: clamp(5.5rem, 9.5vw, 9.5rem) 0;
          background-color: var(--bg-primary);
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2.5rem;
          margin-bottom: clamp(3rem, 6vw, 5rem);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 2.5rem;
        }

        .header-left {
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
          font-size: clamp(2.25rem, 4.5vw, 3.75rem);
          line-height: 1.1;
        }

        .section-description {
          max-width: 440px;
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: clamp(2rem, 4vw, 3rem);
        }

        .service-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
          transition: transform 0.4s var(--ease-editorial), box-shadow 0.4s;
        }

        .service-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: var(--border-light);
        }

        .service-image-wrap {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background-color: var(--bg-secondary);
        }

        .service-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .service-card:hover .service-img {
          transform: scale(1.04);
        }

        .service-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 60%,
            rgba(20, 19, 18, 0.5) 100%
          );
        }

        .service-num {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #FAF8F5;
          background: rgba(20, 19, 18, 0.65);
          backdrop-filter: blur(8px);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .service-body {
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .service-name {
          font-family: var(--font-serif);
          font-size: 1.875rem;
          line-height: 1.2;
          color: var(--text-primary);
          margin-bottom: 0.85rem;
        }

        .service-desc {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 1.75rem;
        }

        .inclusions-block {
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.5rem;
          margin-bottom: 2rem;
          flex: 1;
        }

        .inclusions-label {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          display: block;
          margin-bottom: 0.85rem;
        }

        .inclusions-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .inclusion-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        :global(.check-icon) {
          color: var(--accent-gold);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .service-footer {
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .investment-tag {
          display: flex;
          flex-direction: column;
        }

        .inv-label {
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .inv-value {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .service-cta {
          padding: 0.75rem 1.4rem;
          font-size: 0.75rem;
        }

        @media (max-width: 900px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.25rem;
          }
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
