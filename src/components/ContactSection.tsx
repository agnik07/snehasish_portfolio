"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, MessageSquare, Mail, Calendar, MapPin } from "lucide-react";

interface ContactSectionProps {
  photographerEmail?: string;
  whatsappPhone?: string;
  initialShootType?: string;
}

export default function ContactSection({
  photographerEmail = "contact@snehasishphotography.com",
  whatsappPhone = "+91 98765 43210",
  initialShootType = "Weddings",
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shoot_type: initialShootType,
    preferred_date: "",
    location: "",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<string | null>(null);

  const cleanWhatsappNumber = whatsappPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDevNote(null);

    if (!formData.name.trim()) {
      setError("Please provide your name.");
      return;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!formData.message.trim()) {
      setError("Please share a brief note about your shoot or event.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/public/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send inquiry.");
      }

      setSuccess("Your inquiry has been received with gratitude. Snehasish will review your details and be in touch within 24 to 48 hours.");
      if (data.emailDelivery?.note) {
        setDevNote(data.emailDelivery.note);
      }

      // Reset form on success
      setFormData({
        name: "",
        email: "",
        phone: "",
        shoot_type: "Weddings",
        preferred_date: "",
        location: "",
        budget: "",
        message: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong while submitting. Please try WhatsApp or email directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-grid">
          {/* Left Column: Direct channels & Philosophy */}
          <div className="contact-info-col">
            <span className="section-eyebrow">REACH OUT &amp; CONNECT</span>
            <h2 className="contact-headline">Let&apos;s Create Something Timeless Together</h2>

            <p className="contact-intro">
              Whether you are planning a destination wedding amidst Rajasthan&apos;s royal palaces, an unhurried sunset couple session in South Goa, or an intimate heritage celebration, I would be honored to tell your story.
            </p>

            <div className="direct-channels">
              <a
                href={`mailto:${photographerEmail}`}
                className="channel-card"
                aria-label="Send direct email"
              >
                <div className="channel-icon">
                  <Mail size={20} />
                </div>
                <div className="channel-text">
                  <span className="channel-label">Direct Studio Email</span>
                  <span className="channel-val">{photographerEmail}</span>
                </div>
              </a>

              {whatsappPhone && (
                <a
                  href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent("Hello Snehasish, I'm reaching out regarding photography availability.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-card"
                  aria-label="Chat on WhatsApp"
                >
                  <div className="channel-icon whatsapp-accent">
                    <MessageSquare size={20} />
                  </div>
                  <div className="channel-text">
                    <span className="channel-label">WhatsApp Quick Inquiries</span>
                    <span className="channel-val">{whatsappPhone}</span>
                  </div>
                </a>
              )}
            </div>

            <div className="location-notice">
              <div className="notice-icon">
                <MapPin size={18} />
              </div>
              <div className="notice-content">
                <h4 className="notice-title">Based in Kolkata • Available Worldwide</h4>
                <p className="notice-desc">
                  Dates for peak wedding seasons (October through March) are typically reserved 6 to 12 months in advance. Early inquiry is recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="contact-form-col">
            <div className="form-card">
              <h3 className="form-heading">Inquiry &amp; Date Availability</h3>
              <p className="form-subheading">
                Fill in the details below and we will prepare a bespoke proposal tailored to your vision.
              </p>

              {success ? (
                <div className="alert-box alert-success" role="alert">
                  <CheckCircle2 size={24} className="alert-icon" />
                  <div className="alert-body">
                    <h4 className="alert-title">Inquiry Received</h4>
                    <p className="alert-text">{success}</p>
                    {devNote && (
                      <div className="dev-note-box">
                        <small>💡 <strong>Note for Site Owner:</strong> {devNote}</small>
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn-outline btn-reset"
                      onClick={() => setSuccess(null)}
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="inquiry-form">
                  {error && (
                    <div className="alert-box alert-error" role="alert">
                      <AlertCircle size={20} className="alert-icon" />
                      <p className="alert-text">{error}</p>
                    </div>
                  )}

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="inquiry-name" className="form-label">
                        Your Full Name <span className="req">*</span>
                      </label>
                      <input
                        id="inquiry-name"
                        type="text"
                        required
                        placeholder="e.g. Meera &amp; Aarav"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="inquiry-email" className="form-label">
                        Email Address <span className="req">*</span>
                      </label>
                      <input
                        id="inquiry-email"
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="inquiry-phone" className="form-label">
                        WhatsApp / Phone Number
                      </label>
                      <input
                        id="inquiry-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="inquiry-type" className="form-label">
                        Type of Photoshoot <span className="req">*</span>
                      </label>
                      <select
                        id="inquiry-type"
                        value={formData.shoot_type}
                        onChange={(e) => setFormData({ ...formData, shoot_type: e.target.value })}
                        className="form-select"
                      >
                        <option value="Weddings">Wedding Celebrations</option>
                        <option value="Pre-Wedding">Pre-Wedding Story</option>
                        <option value="Post-Wedding">Post-Wedding Session</option>
                        <option value="Engagement & Couples">Engagement &amp; Couple Portraits</option>
                        <option value="Portraits">Individual Fine Art Portraits</option>
                        <option value="Fashion & Editorial">Fashion &amp; Editorial</option>
                        <option value="Events & Celebrations">Events &amp; Private Celebrations</option>
                        <option value="Other Photography">Other Photography</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="inquiry-date" className="form-label">
                        Preferred Date(s)
                      </label>
                      <input
                        id="inquiry-date"
                        type="text"
                        placeholder="e.g. November 2026 or approx. month"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="inquiry-location" className="form-label">
                        Event / Shoot Location
                      </label>
                      <input
                        id="inquiry-location"
                        type="text"
                        placeholder="e.g. Udaipur, Goa, Kolkata, International"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="inquiry-budget" className="form-label">
                      Approximate Budget Range (Optional)
                    </label>
                    <select
                      id="inquiry-budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Select an investment tier (Optional)</option>
                      <option value="Under ₹1,50,000">Under ₹1,50,000</option>
                      <option value="₹1,50,000 - ₹3,00,000">₹1,50,000 - ₹3,00,000</option>
                      <option value="₹3,00,000 - ₹6,00,000">₹3,00,000 - ₹6,00,000</option>
                      <option value="₹6,00,000+ (Grand Multi-day Destination)">₹6,00,000+ (Grand Multi-day Destination)</option>
                      <option value="Contact for Custom Estimate">Custom / Inquire for Options</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="inquiry-message" className="form-label">
                      Your Story &amp; Details <span className="req">*</span>
                    </label>
                    <textarea
                      id="inquiry-message"
                      required
                      placeholder="Tell us about yourselves, your envisioned ceremony or session, venues, and what moments matter most to you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-textarea"
                    />
                  </div>

                  <p className="privacy-disclosure">
                    🔒 We respect your confidentiality. Your contact information is never shared or added to marketing lists.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary form-submit-btn"
                  >
                    <span>{loading ? "Sending Your Inquiry..." : "Submit Inquiry"}</span>
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-section {
          padding: clamp(5.5rem, 9.5vw, 9.5rem) 0;
          background-color: var(--bg-primary);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: flex-start;
        }

        .contact-info-col {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .section-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent-gold);
        }

        .contact-headline {
          font-size: clamp(2.25rem, 4.2vw, 3.5rem);
          line-height: 1.15;
        }

        .contact-intro {
          font-size: 1rem;
          line-height: 1.75;
          color: var(--text-secondary);
        }

        .direct-channels {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .channel-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem 1.5rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          text-decoration: none;
          color: inherit;
          transition: all 0.3s var(--ease-editorial);
        }

        .channel-card:hover {
          border-color: var(--text-primary);
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .channel-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(26, 24, 22, 0.04);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .whatsapp-accent {
          background: rgba(56, 106, 70, 0.1);
          color: var(--status-success);
        }

        .channel-text {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .channel-label {
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .channel-val {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .location-notice {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          margin-top: 1rem;
        }

        .notice-icon {
          color: var(--accent-gold);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notice-title {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          margin-bottom: 0.35rem;
          color: var(--text-primary);
        }

        .notice-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Form Card */
        .form-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: clamp(2rem, 5vw, 3.5rem);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
        }

        .form-heading {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .form-subheading {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 2.25rem;
          line-height: 1.6;
        }

        .inquiry-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .req {
          color: var(--accent-gold);
        }

        .privacy-disclosure {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .form-submit-btn {
          width: 100%;
          padding: 1.15rem;
          margin-top: 0.5rem;
        }

        .alert-box {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }

        .alert-success {
          background-color: rgba(56, 106, 70, 0.08);
          border: 1px solid rgba(56, 106, 70, 0.25);
          color: var(--status-success);
        }

        .alert-error {
          background-color: rgba(155, 59, 59, 0.08);
          border: 1px solid rgba(155, 59, 59, 0.25);
          color: var(--status-error);
        }

        .alert-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .alert-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--text-primary);
        }

        .alert-text {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .dev-note-box {
          background: #FAF8F5;
          padding: 0.75rem 1rem;
          border-left: 3px solid var(--accent-gold);
          color: #5C5853;
          margin: 0.75rem 0;
          font-size: 0.8125rem;
        }

        .btn-reset {
          margin-top: 1rem;
          align-self: flex-start;
          padding: 0.65rem 1.25rem;
          font-size: 0.75rem;
        }

        @media (max-width: 960px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
