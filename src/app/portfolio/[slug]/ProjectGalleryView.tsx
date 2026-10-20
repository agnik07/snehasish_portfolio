"use client";

import React, { useState } from "react";
import Lightbox, { LightboxPhoto } from "@/components/Lightbox";
import { Maximize2 } from "lucide-react";

interface ProjectGalleryViewProps {
  photos: LightboxPhoto[];
  projectTitle: string;
}

export default function ProjectGalleryView({ photos, projectTitle }: ProjectGalleryViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="photo-story-sequence" aria-label={`Photo narrative for ${projectTitle}`}>
        {photos.map((photo, index) => {
          // Curate layout presentation:
          // index 0: Full bleed or wide cinematic landscape
          // index 1 & 2: Paired portrait duo side-by-side
          // index 3: Centered editorial statement image
          // index 4 & 5: Asymmetric dynamic pair
          const isDuo = (index % 3 === 1 && index + 1 < photos.length);
          const isSecondInDuo = (index % 3 === 2);

          // If this is the second image of a duo, we skip standalone render since it's rendered in the pair container
          if (isSecondInDuo) return null;

          if (isDuo) {
            const nextPhoto = photos[index + 1];
            return (
              <div key={photo.id || index} className="story-row-duo">
                <div
                  className="story-photo-card duo-item"
                  onClick={() => openLightbox(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openLightbox(index); }}
                  aria-label={`View photo ${index + 1} of ${photos.length} in full screen`}
                >
                  <div className="photo-img-wrap portrait-wrap">
                    <img
                      src={photo.url}
                      alt={photo.alt_text || photo.caption || `${projectTitle} photo ${index + 1}`}
                      className="story-img"
                      loading="lazy"
                    />
                    <div className="photo-zoom-hint">
                      <Maximize2 size={16} />
                    </div>
                  </div>
                  {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                </div>

                <div
                  className="story-photo-card duo-item"
                  onClick={() => openLightbox(index + 1)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openLightbox(index + 1); }}
                  aria-label={`View photo ${index + 2} of ${photos.length} in full screen`}
                >
                  <div className="photo-img-wrap portrait-wrap">
                    <img
                      src={nextPhoto.url}
                      alt={nextPhoto.alt_text || nextPhoto.caption || `${projectTitle} photo ${index + 2}`}
                      className="story-img"
                      loading="lazy"
                    />
                    <div className="photo-zoom-hint">
                      <Maximize2 size={16} />
                    </div>
                  </div>
                  {nextPhoto.caption && <p className="photo-caption">{nextPhoto.caption}</p>}
                </div>
              </div>
            );
          }

          // Single full or centered landscape frame
          return (
            <div
              key={photo.id || index}
              className="story-row-single"
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openLightbox(index); }}
              aria-label={`View photo ${index + 1} of ${photos.length} in full screen`}
            >
              <div className="photo-img-wrap cinematic-wrap">
                <img
                  src={photo.url}
                  alt={photo.alt_text || photo.caption || `${projectTitle} photo ${index + 1}`}
                  className="story-img"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="photo-zoom-hint">
                  <Maximize2 size={18} />
                </div>
              </div>
              {photo.caption && <p className="photo-caption-centered">{photo.caption}</p>}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        photos={photos}
        currentIndex={activePhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIdx) => setActivePhotoIndex(newIdx)}
      />

      <style jsx>{`
        .photo-story-sequence {
          display: flex;
          flex-direction: column;
          gap: clamp(3rem, 6vw, 6rem);
          margin: 4.5rem 0;
        }

        .story-row-single {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cinematic-wrap {
          width: 100%;
          position: relative;
          overflow: hidden;
          background-color: var(--bg-secondary);
        }

        .portrait-wrap {
          width: 100%;
          aspect-ratio: 4 / 5;
          position: relative;
          overflow: hidden;
          background-color: var(--bg-secondary);
        }

        .story-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .story-row-single:hover .story-img,
        .story-photo-card:hover .story-img {
          transform: scale(1.02);
        }

        .photo-zoom-hint {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(20, 19, 18, 0.75);
          backdrop-filter: blur(8px);
          color: #FAF8F5;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(6px);
          transition: all 0.3s var(--ease-editorial);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .story-row-single:hover .photo-zoom-hint,
        .story-photo-card:hover .photo-zoom-hint {
          opacity: 1;
          transform: translateY(0);
        }

        .photo-caption-centered {
          margin-top: 1.25rem;
          font-family: var(--font-serif);
          font-size: 1.125rem;
          font-style: italic;
          color: var(--text-secondary);
          text-align: center;
          max-width: 680px;
          line-height: 1.6;
        }

        .photo-caption {
          margin-top: 0.85rem;
          font-family: var(--font-serif);
          font-size: 1rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .story-row-duo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1.5rem, 3.5vw, 3rem);
          width: 100%;
        }

        .story-photo-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .story-row-duo {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
