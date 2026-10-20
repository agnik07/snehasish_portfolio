"use client";

import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxPhoto {
  id?: string;
  url: string;
  caption?: string | null;
  alt_text?: string | null;
  aspect_ratio?: string;
}

interface LightboxProps {
  photos: LightboxPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const currentPhoto = photos[currentIndex];

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    const prev = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    onNavigate(prev);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    const next = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    onNavigate(next);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      className={`lightbox-backdrop ${isOpen ? "active" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen photograph viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Header: Counter & Close */}
      <div className="lightbox-top-bar">
        <div className="lightbox-counter">
          {currentIndex + 1} / {photos.length}
        </div>
        <button
          type="button"
          className="lightbox-close-btn"
          onClick={onClose}
          aria-label="Close full-screen image viewer (Esc)"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav-btn lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous photograph (Left Arrow)"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            className="lightbox-nav-btn lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next photograph (Right Arrow)"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Main Photograph Display */}
      <div className="lightbox-center-container" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-media-wrapper">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt_text || currentPhoto.caption || `Photograph ${currentIndex + 1}`}
            className="lightbox-main-img"
          />
        </div>

        {/* Caption */}
        {currentPhoto.caption && (
          <p className="lightbox-caption-text">
            {currentPhoto.caption}
          </p>
        )}
      </div>

      <style jsx>{`
        .lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(14, 13, 12, 0.96);
          backdrop-filter: blur(16px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.25s var(--ease-editorial) forwards;
        }

        .lightbox-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
        }

        .lightbox-counter {
          color: #A39E96;
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: rgba(30, 28, 26, 0.6);
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lightbox-close-btn {
          background: rgba(30, 28, 26, 0.6);
          color: #FAF8F5;
          border: 1px solid rgba(255, 255, 255, 0.15);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
        }

        .lightbox-close-btn:hover {
          background: #FAF8F5;
          color: var(--text-primary);
        }

        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(30, 28, 26, 0.6);
          color: #FAF8F5;
          border: 1px solid rgba(255, 255, 255, 0.15);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s var(--ease-editorial);
          z-index: 20;
        }

        .lightbox-nav-btn:hover {
          background: #FAF8F5;
          color: var(--text-primary);
        }

        .lightbox-prev {
          left: 2rem;
        }

        .lightbox-next {
          right: 2rem;
        }

        .lightbox-center-container {
          position: relative;
          max-width: 90vw;
          max-height: 86vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .lightbox-media-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          max-height: calc(84vh - 50px);
        }

        .lightbox-main-img {
          max-width: 90vw;
          max-height: calc(84vh - 50px);
          object-fit: contain;
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.6);
          user-select: none;
        }

        .lightbox-caption-text {
          margin-top: 1rem;
          color: #D6CFCE;
          font-family: var(--font-serif);
          font-size: 1.125rem;
          font-style: italic;
          text-align: center;
          max-width: 700px;
          line-height: 1.4;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .lightbox-nav-btn {
            width: 42px;
            height: 42px;
          }
          .lightbox-prev {
            left: 0.75rem;
          }
          .lightbox-next {
            right: 0.75rem;
          }
          .lightbox-top-bar {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
