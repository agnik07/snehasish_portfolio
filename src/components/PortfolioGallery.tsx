"use client";

import React, { useState, useMemo } from "react";
import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProjectSummary } from "./SelectedWork";

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order_index?: number;
}

interface PortfolioGalleryProps {
  categories: CategorySummary[];
  projects: ProjectSummary[];
  initialCategorySlug?: string;
}

export default function PortfolioGallery({
  categories,
  projects,
  initialCategorySlug = "all",
}: PortfolioGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") {
      return projects;
    }
    return projects.filter((p) => {
      const cat = categories.find((c) => c.slug === selectedCategory);
      return cat ? p.category_name.toLowerCase() === cat.name.toLowerCase() : true;
    });
  }, [projects, categories, selectedCategory]);

  return (
    <div className="portfolio-gallery-wrapper">
      {/* Category Filter Tabs */}
      <div className="filter-nav" role="tablist" aria-label="Photography Categories">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "all"}
          className={`filter-tab ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All Stories ({projects.length})
        </button>
        {categories.map((cat) => {
          const count = projects.filter(
            (p) => p.category_name.toLowerCase() === cat.name.toLowerCase()
          ).length;

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.slug}
              className={`filter-tab ${selectedCategory === cat.slug ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-category">
          <p className="empty-title">No Stories in This Category Yet</p>
          <p className="empty-sub">
            The photographer is preparing new photo stories for this section. Check back soon.
          </p>
        </div>
      ) : (
        <div className="gallery-masonry-grid">
          {filteredProjects.map((project, idx) => (
            <NextLink
              key={project.id}
              href={`/portfolio/${project.slug}`}
              className="gallery-item-card"
            >
              <div className="gallery-img-container">
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  loading={idx < 4 ? "eager" : "lazy"}
                  className="gallery-img"
                />
                <div className="gallery-img-overlay" />
                <span className="gallery-cat-badge">{project.category_name}</span>
                <div className="gallery-hover-icon" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div className="gallery-card-content">
                <div className="gallery-card-meta">
                  {project.client_names && (
                    <span className="gallery-client">{project.client_names}</span>
                  )}
                  {project.location && (
                    <span className="gallery-loc">• {project.location}</span>
                  )}
                </div>
                <h3 className="gallery-card-title">{project.title}</h3>
                <p className="gallery-card-excerpt">
                  {project.description.slice(0, 115)}...
                </p>
              </div>
            </NextLink>
          ))}
        </div>
      )}

      <style jsx>{`
        .portfolio-gallery-wrapper {
          width: 100%;
        }

        .filter-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.65rem;
          margin: 0 auto 3.5rem;
          max-width: 1100px;
        }

        .filter-tab {
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.6rem 1.35rem;
          border-radius: 9999px;
          border: 1px solid var(--border-light);
          background-color: transparent;
          color: var(--text-secondary);
          transition: all 0.25s var(--ease-editorial);
          cursor: pointer;
        }

        .filter-tab:hover {
          color: var(--text-primary);
          border-color: var(--text-primary);
          background-color: rgba(26, 24, 22, 0.04);
        }

        .filter-tab.active {
          background-color: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
          font-weight: 500;
        }

        /* Gallery Grid */
        .gallery-masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: clamp(1.75rem, 3.5vw, 3rem);
        }

        .gallery-item-card {
          text-decoration: none;
          display: flex;
          flex-direction: column;
        }

        .gallery-img-container {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 11;
          background-color: var(--bg-secondary);
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gallery-item-card:hover .gallery-img {
          transform: scale(1.04);
        }

        .gallery-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 50%,
            rgba(20, 19, 18, 0.45) 100%
          );
          opacity: 0.3;
          transition: opacity 0.35s;
        }

        .gallery-item-card:hover .gallery-img-overlay {
          opacity: 0.6;
        }

        .gallery-cat-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(20, 19, 18, 0.72);
          backdrop-filter: blur(8px);
          color: #FAF8F5;
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.3rem 0.8rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .gallery-hover-icon {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(250, 248, 245, 0.95);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(6px);
          transition: all 0.3s var(--ease-editorial);
        }

        .gallery-item-card:hover .gallery-hover-icon {
          opacity: 1;
          transform: translateY(0);
        }

        .gallery-card-content {
          padding-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .gallery-card-meta {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .gallery-client {
          color: var(--accent-gold);
          font-weight: 500;
        }

        .gallery-card-title {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: var(--text-primary);
          line-height: 1.2;
          font-weight: 400;
          transition: color 0.25s;
        }

        .gallery-item-card:hover .gallery-card-title {
          color: var(--accent-gold);
        }

        .gallery-card-excerpt {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-top: 0.25rem;
        }

        .empty-category {
          text-align: center;
          padding: 5rem 1rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
        }

        .empty-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-sub {
          color: var(--text-muted);
          font-size: 0.9375rem;
        }

        @media (max-width: 640px) {
          .gallery-masonry-grid {
            grid-template-columns: 1fr;
          }
          .filter-nav {
            justify-content: flex-start;
            overflow-x: auto;
            padding-bottom: 0.75rem;
            flex-wrap: nowrap;
          }
          .filter-tab {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
