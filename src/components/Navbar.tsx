"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

interface NavbarProps {
  brandName?: string;
}

export default function Navbar({
  brandName = "SNEHASISH DUTTA",
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className={`minimal-header ${isScrolled ? "header-scrolled" : ""}`}>
        <div className="header-container container">
          {/* Photographer Name / Wordmark on Left */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="brand-wordmark"
            aria-label="Scroll to top"
          >
            <span className="brand-title">{brandName}</span>
          </button>

          {/* Minimal Public Navigation on Right */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <button type="button" onClick={() => scrollTo("work")} className="nav-link">
              Work
            </button>
            <button type="button" onClick={() => scrollTo("about")} className="nav-link">
              About
            </button>
            <button type="button" onClick={() => scrollTo("contact")} className="nav-link">
              Contact
            </button>
            <button
              type="button"
              onClick={() => scrollTo("quote")}
              className="btn-primary btn-quote-nav"
            >
              <span>Get a Quote</span>
              <ArrowRight size={13} />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" role="dialog" aria-modal="true">
          <div className="mobile-menu-container">
            <div className="mobile-menu-header">
              <span className="brand-title">{brandName}</span>
              <button
                type="button"
                className="mobile-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
            </div>

            <div className="mobile-links-list">
              <button
                type="button"
                className="mobile-link"
                onClick={() => scrollTo("work")}
              >
                Work
              </button>
              <button
                type="button"
                className="mobile-link"
                onClick={() => scrollTo("about")}
              >
                About
              </button>
              <button
                type="button"
                className="mobile-link"
                onClick={() => scrollTo("contact")}
              >
                Contact
              </button>
              <button
                type="button"
                className="btn-primary mobile-quote-btn"
                onClick={() => scrollTo("quote")}
              >
                <span>Get a Quote</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mobile-footer-text">
              <p>Fine Art &amp; Documentary Photography</p>
              <small>Based in India • Available Worldwide</small>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .minimal-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: var(--header-height);
          display: flex;
          align-items: center;
          background: rgba(3, 17, 27, 0.4);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(247, 247, 245, 0.05);
          transition: all 0.3s var(--ease-editorial);
        }

        .header-scrolled {
          background: rgba(3, 17, 27, 0.92);
          border-bottom: 1px solid var(--border-subtle);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .brand-wordmark {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .brand-title {
          font-family: var(--font-sans);
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-primary);
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .nav-link {
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .btn-quote-nav {
          padding: 0.6rem 1.4rem;
          font-size: 0.75rem;
          background-color: var(--accent-gold);
          border-color: var(--accent-gold);
          color: #03111B;
        }

        .btn-quote-nav:hover {
          background-color: var(--accent-gold-hover);
          border-color: var(--accent-gold-hover);
        }

        .mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
        }

        /* Mobile Drawer */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 17, 27, 0.98);
          backdrop-filter: blur(20px);
          z-index: 10001;
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 2rem;
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .mobile-close {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mobile-links-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin: 4rem 0 auto;
        }

        .mobile-link {
          font-family: var(--font-sans);
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--text-primary);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          transition: color 0.2s;
        }

        .mobile-link:hover {
          color: var(--accent-gold);
        }

        .mobile-quote-btn {
          margin-top: 1rem;
          width: 100%;
          padding: 1.1rem;
          background: var(--accent-gold);
          color: #03111B;
          border-color: var(--accent-gold);
        }

        .mobile-footer-text {
          padding-top: 2rem;
          border-top: 1px solid var(--border-subtle);
          color: var(--text-muted);
          font-size: 0.8125rem;
        }

        @media (max-width: 840px) {
          .desktop-nav {
            display: none;
          }
          .mobile-toggle-btn {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
