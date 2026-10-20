"use client";

import React from "react";
import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  category_name: string;
  category_slug?: string;
  client_names?: string | null;
  location?: string | null;
  shoot_date?: string | null;
  cover_image_url: string;
  description: string;
  is_featured: number;
  photoCount?: number;
}

interface SelectedWorkProps {
  projects: ProjectSummary[];
}

export default function SelectedWork({ projects }: SelectedWorkProps) {
  // Show featured projects first or top 5
  const displayProjects = projects.filter((p) => p.is_featured === 1);
  const items = displayProjects.length > 0 ? displayProjects : projects.slice(0, 5);

  return (
    <section id="selected-stories" className="selected-work-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="header-left">
            <span className="section-eyebrow">CURATED EDITORIAL ARCHIVE</span>
            <h2 className="section-title">Selected Visual Stories</h2>
          </div>
          <p className="section-description">
            Each photographic story is documented with patience, intimacy, and an artistic devotion to authentic human connection.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="editorial-grid">
          {items.map((project, index) => {
            // Cycle through curated asymmetrical layout classes:
            // index 0: large panoramic hero card (span 2 cols)
            // index 1: tall portrait (span 1 col)
            // index 2: medium landscape (span 1 col)
            // index 3: full width story feature
            // index 4: elegant tall portrait
            let layoutClass = "grid-item-medium";
            if (index === 0) layoutClass = "grid-item-featured";
            else if (index === 1) layoutClass = "grid-item-portrait";
            else if (index === 2) layoutClass = "grid-item-landscape";
            else if (index === 3) layoutClass = "grid-item-wide";

            return (
              <NextLink
                key={project.id}
                href={`/portfolio/${project.slug}`}
                className={`story-card ${layoutClass}`}
              >
                <div className="story-image-wrap">
                  <img
                    src={project.cover_image_url}
                    alt={project.title}
                    loading={index < 2 ? "eager" : "lazy"}
                    className="story-image"
                  />
                  <div className="story-overlay" />
                  
                  {/* Category Pill Tag */}
                  <span className="category-tag">{project.category_name}</span>

                  {/* Corner Expand Indicator */}
                  <div className="expand-indicator" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                <div className="story-info">
                  <div className="story-meta">
                    {project.client_names && (
                      <span className="client-names">{project.client_names}</span>
                    )}
                    {project.location && (
                      <span className="location-tag">• {project.location}</span>
                    )}
                  </div>
                  <h3 className="story-title">{project.title}</h3>
                </div>
              </NextLink>
            );
          })}
        </div>

        {/* View All Stories Navigation Banner */}
        <div className="view-all-wrapper">
          <NextLink href="/portfolio" className="btn-primary view-all-btn">
            <span>Explore All Stories</span>
            <ArrowUpRight size={16} />
          </NextLink>
        </div>
      </div>

      <style jsx>{`
        .selected-work-section {
          padding: clamp(5rem, 9vw, 9rem) 0;
          background-color: var(--bg-primary);
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2.5rem;
          margin-bottom: clamp(3rem, 6vw, 5.5rem);
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

        /* Editorial Asymmetrical Grid */
        .editorial-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: clamp(1.5rem, 3.5vw, 3rem);
        }

        .story-card {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          group: true;
        }

        .grid-item-featured {
          grid-column: span 8;
        }

        .grid-item-portrait {
          grid-column: span 4;
        }

        .grid-item-landscape {
          grid-column: span 6;
        }

        .grid-item-medium {
          grid-column: span 6;
        }

        .grid-item-wide {
          grid-column: span 12;
        }

        .story-image-wrap {
          position: relative;
          overflow: hidden;
          background-color: var(--bg-secondary);
          width: 100%;
        }

        .grid-item-featured .story-image-wrap {
          aspect-ratio: 16 / 10;
        }

        .grid-item-portrait .story-image-wrap {
          aspect-ratio: 4 / 5;
        }

        .grid-item-landscape .story-image-wrap {
          aspect-ratio: 16 / 10;
        }

        .grid-item-wide .story-image-wrap {
          aspect-ratio: 21 / 9;
        }

        .story-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .story-card:hover .story-image {
          transform: scale(1.035);
        }

        .story-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.1) 0%,
            transparent 40%,
            rgba(20, 19, 18, 0.5) 100%
          );
          opacity: 0.4;
          transition: opacity 0.4s var(--ease-editorial);
        }

        .story-card:hover .story-overlay {
          opacity: 0.65;
        }

        .category-tag {
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          background: rgba(20, 19, 18, 0.7);
          backdrop-filter: blur(8px);
          color: #FAF8F5;
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .expand-indicator {
          position: absolute;
          bottom: 1.25rem;
          right: 1.25rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(250, 248, 245, 0.92);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8) translateY(8px);
          transition: all 0.35s var(--ease-editorial);
        }

        .story-card:hover .expand-indicator {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .story-info {
          padding-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .story-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .client-names {
          color: var(--accent-gold);
          font-weight: 500;
        }

        .story-title {
          font-family: var(--font-serif);
          font-size: 1.625rem;
          color: var(--text-primary);
          line-height: 1.2;
          font-weight: 400;
          transition: color 0.3s;
        }

        .story-card:hover .story-title {
          color: var(--accent-gold);
        }

        .view-all-wrapper {
          display: flex;
          justify-content: center;
          margin-top: clamp(3.5rem, 7vw, 6rem);
        }

        .view-all-btn {
          padding: 1.15rem 2.75rem;
        }

        @media (max-width: 960px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.25rem;
          }
          .grid-item-featured,
          .grid-item-portrait,
          .grid-item-landscape,
          .grid-item-medium,
          .grid-item-wide {
            grid-column: span 12;
          }
          .grid-item-portrait .story-image-wrap {
            aspect-ratio: 16 / 11;
          }
          .grid-item-wide .story-image-wrap {
            aspect-ratio: 16 / 10;
          }
        }
      `}</style>
    </section>
  );
}
