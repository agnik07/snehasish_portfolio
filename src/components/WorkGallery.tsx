"use client";

import React, { useState, useMemo } from "react";
import Lightbox, { LightboxPhoto } from "./Lightbox";
import { ArrowUpRight } from "lucide-react";

export interface GalleryPhotoItem {
  id: string;
  url: string;
  title?: string;
  caption?: string | null;
  alt_text?: string | null;
  category?: string;
  aspect_ratio?: "portrait" | "landscape" | "square";
  featured?: boolean;
}

interface WorkGalleryProps {
  photos: GalleryPhotoItem[];
}

export default function WorkGallery({ photos }: WorkGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Available simple categories
  const categories = ["All", "Weddings", "Couples", "Portraits"];

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "All") return photos;
    return photos.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      if (selectedCategory === "Weddings") return cat.includes("wedding");
      if (selectedCategory === "Couples") return cat.includes("couple") || cat.includes("pre-wedding") || cat.includes("engagement");
      if (selectedCategory === "Portraits") return cat.includes("portrait") || cat.includes("editorial");
      return true;
    });
  }, [photos, selectedCategory]);

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  };

  const lightboxItems: LightboxPhoto[] = filteredPhotos.map((p) => ({
    id: p.id,
    url: p.url,
    caption: p.caption || p.title,
    alt_text: p.alt_text || p.title,
  }));

  return (
    <section id="work" className="work-gallery-section" aria-label="Selected Photography">
      <div className="container">
        {/* Section Header */}
        <div className="work-header">
          <div className="header-titles">
            <span className="section-eyebrow">PORTFOLIO ARCHIVE</span>
            <h2 className="section-heading">Selected Works</h2>
          </div>

          {/* Simple Minimal Filter Tabs */}
          <div className="filter-tabs" role="tablist" aria-label="Category Filter">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`filter-tab ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="asymmetric-editorial-grid">
          {filteredPhotos.map((photo, idx) => {
            // Determine varied visual column spans based on aspect ratio and rhythm:
            // Every 5th item can be an immersive wide statement (span 2 cols)
            // Portrait items span 1 col with tall aspect ratio
            // Landscape items span 1 or 2 cols
            const isWide = (idx % 7 === 0 || idx % 7 === 4);
            const cardClass = isWide
              ? "grid-card-wide"
              : photo.aspect_ratio === "portrait"
              ? "grid-card-tall"
              : "grid-card-standard";

            return (
              <div
                key={photo.id || idx}
                className={`gallery-card ${cardClass}`}
                onClick={() => openLightbox(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openLightbox(idx);
                }}
                aria-label={`Open ${photo.title || "photograph"} in lightbox`}
              >
                <div className="image-wrapper">
                  <img
                    src={photo.url}
                    alt={photo.alt_text || photo.title || "Editorial photograph"}
                    loading={idx < 4 ? "eager" : "lazy"}
                    className="gallery-image"
                  />
                  <div className="image-hover-overlay" />

                  {/* Top Category Tag */}
                  {photo.category && (
                    <span className="card-cat-badge">{photo.category}</span>
                  )}

                  {/* Corner Expand Icon */}
                  <div className="card-expand-icon" aria-hidden="true">
                    <ArrowUpRight size={17} />
                  </div>
                </div>

                {/* Subtitle / Caption Info */}
                {(photo.title || photo.caption) && (
                  <div className="card-info">
                    {photo.title && <h3 className="card-title">{photo.title}</h3>}
                    {photo.caption && <p className="card-caption">{photo.caption}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Viewer */}
      <Lightbox
        photos={lightboxItems}
        currentIndex={activePhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIdx) => setActivePhotoIndex(newIdx)}
      />

      <style jsx>{`
        .work-gallery-section {
          padding: clamp(6rem, 10vw, 10rem) 0;
          background-color: var(--bg-primary);
        }

        .work-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 2rem;
          flex-wrap: wrap;
        }

        .header-titles {
          display: flex;
          flex-direction: column;
        }

        /* Asymmetrical Editorial Grid */
        .asymmetric-editorial-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: clamp(1.5rem, 3vw, 2.75rem);
        }

        .gallery-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          outline: none;
          position: relative;
        }

        .grid-card-wide {
          grid-column: span 8;
        }

        .grid-card-tall {
          grid-column: span 4;
        }

        .grid-card-standard {
          grid-column: span 6;
        }

        .image-wrapper {
          position: relative;
          overflow: hidden;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          width: 100%;
        }

        .grid-card-wide .image-wrapper {
          aspect-ratio: 16 / 10;
        }

        .grid-card-tall .image-wrapper {
          aspect-ratio: 4 / 5.2;
        }

        .grid-card-standard .image-wrapper {
          aspect-ratio: 16 / 11;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.85s var(--ease-editorial), filter 0.4s;
          filter: brightness(0.96);
        }

        .gallery-card:hover .gallery-image {
          transform: scale(1.035);
          filter: brightness(1);
        }

        .image-hover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(3, 17, 27, 0.1) 0%,
            transparent 45%,
            rgba(3, 17, 27, 0.7) 100%
          );
          opacity: 0.35;
          transition: opacity 0.35s var(--ease-editorial);
          pointer-events: none;
        }

        .gallery-card:hover .image-hover-overlay {
          opacity: 0.75;
        }

        .card-cat-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #FAF8F5;
          background: rgba(3, 17, 27, 0.8);
          backdrop-filter: blur(8px);
          padding: 0.3rem 0.75rem;
          border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-expand-icon {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--accent-gold);
          color: #03111B;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.85) translateY(6px);
          transition: all 0.3s var(--ease-editorial);
        }

        .gallery-card:hover .card-expand-icon {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .card-info {
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .card-title {
          font-family: var(--font-sans);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          line-height: 1.3;
          transition: color 0.2s;
        }

        .gallery-card:hover .card-title {
          color: var(--accent-gold);
        }

        .card-caption {
          font-family: var(--font-serif);
          font-size: 0.9375rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 960px) {
          .grid-card-wide,
          .grid-card-tall,
          .grid-card-standard {
            grid-column: span 12;
          }
          .grid-card-tall .image-wrapper {
            aspect-ratio: 4 / 4.8;
          }
        }
      `}</style>
    </section>
  );
}
