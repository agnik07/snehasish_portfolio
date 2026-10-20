"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Mail, MessageSquare, ArrowUpRight, MapPin } from "lucide-react";

interface ContactAndQuoteProps {
  contactEmail?: string;
  whatsappPhone?: string;
  instagramUrl?: string;
  serviceArea?: string;
}

export default function ContactAndQuote({
  contactEmail = "contact@snehasishphotography.com",
  whatsappPhone = "+91 98765 43210",
  instagramUrl = "https://instagram.com",
  serviceArea = "Based in India • Available Worldwide for Destination Assignments",
}: ContactAndQuoteProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shoot_type: "Wedding Celebrations",
    preferred_date: "",
    location: "",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<string | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number>(0);

  const cleanWhatsappNumber = (whatsappPhone || "").replace(/[^\d+]/g, "").replace(/^\+/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDevNote(null);

    // Prevent accidental double clicks within 3 seconds
    const now = Date.now();
    if (now - lastSubmittedAt < 3000) {
      return;
    }

    if (!formData.name.trim()) {
      setError("Please provide your name.");
      return;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!formData.message.trim()) {
      setError("Please write a short note about your envisioned shoot.");
      return;
    }

    setLoading(true);
    setLastSubmittedAt(now);

    try {
      const res = await fetch("/api/public/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSuccess(
        "Thank you. Your quotation request has been received with gratitude. Snehasish will personally review your vision and reply within 24 to 48 hours."
      );
      if (data.emailDelivery?.note) {
        setDevNote(data.emailDelivery.note);
      }

      // Reset form fields
      setFormData({
        name: "",
        email: "",
        phone: "",
        shoot_type: "Wedding Celebrations",
        preferred_date: "",
        location: "",
        budget: "",
        message: "",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your inquiry at this moment. Please reach out directly via WhatsApp or email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-quote-section" aria-label="Contact and Booking Inquiries">
      <div className="container">
        <div className="contact-quote-grid">
          {/* Left Column: Direct Contact & Invitation */}
          <div className="contact-info-panel">
            <div className="panel-header">
              <span className="section-eyebrow">COMMISSIONS &amp; CONTACT</span>
              <h2 className="section-heading contact-title">
                Let&apos;s Document Your Story
              </h2>
            </div>

            <p className="contact-lead">
              Every commission begins with a conversation. Whether you are orchestrating a multi-day palace wedding, an intimate sunset ceremony, or an editorial portrait session, I look forward to hearing your ideas.
            </p>

            <div className="channels-stack">
              {/* Email */}
              <a href={`mailto:${contactEmail}`} className="channel-box" aria-label="Direct Studio Email">
                <div className="channel-icon-wrap">
                  <Mail size={18} />
                </div>
                <div className="channel-details">
                  <span className="channel-caption">Studio Email</span>
                  <span className="channel-value">{contactEmail}</span>
                </div>
                <ArrowUpRight size={16} className="channel-arrow" />
              </a>

              {/* WhatsApp */}
              {whatsappPhone && (
                <a
                  href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
                    "Hello Snehasish, I am inquiring regarding photography availability."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-box"
                  aria-label="Direct WhatsApp Message"
                >
                  <div className="channel-icon-wrap icon-whatsapp">
                    <MessageSquare size={18} />
                  </div>
                  <div className="channel-details">
                    <span className="channel-caption">WhatsApp Direct</span>
                    <span className="channel-value">{whatsappPhone}</span>
                  </div>
                  <ArrowUpRight size={16} className="channel-arrow" />
                </a>
              )}

              {/* Instagram */}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-box"
                  aria-label="Instagram Profile"
                >
                  <div className="channel-icon-wrap">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div className="channel-details">
                    <span className="channel-caption">Visual Journal</span>
                    <span className="channel-value">@snehasish.photography</span>
                  </div>
                  <ArrowUpRight size={16} className="channel-arrow" />
                </a>
              )}
            </div>

            {/* Service Area Card */}
            <div className="service-location-badge">
              <MapPin size={16} className="pin-icon" />
              <div className="location-text">
                <span className="location-head">{serviceArea}</span>
                <span className="location-sub">
                  Peak wedding dates (October &ndash; March) typically book 6&ndash;12 months ahead.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Quote Request Form */}
          <div id="quote" className="quote-form-panel">
            <div className="form-wrapper-card">
              <div className="form-card-header">
                <span className="quote-kicker">INQUIRY &amp; ESTIMATE</span>
                <h3 className="form-card-title">Request a Quotation</h3>
                <p className="form-card-desc">
                  Share your date, location, and envisioned celebration to receive a tailored quotation.
                </p>
              </div>

              {success ? (
                <div className="form-alert alert-success" role="alert">
                  <CheckCircle2 size={24} className="alert-icon" />
                  <div className="alert-content">
                    <h4 className="alert-heading">Inquiry Received</h4>
                    <p className="alert-message">{success}</p>
                    {devNote && (
                      <div className="dev-config-note">
                        <small>💡 <strong>Server Note:</strong> {devNote}</small>
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn-outline btn-new-inquiry"
                      onClick={() => setSuccess(null)}
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="editorial-form">
                  {error && (
                    <div className="form-alert alert-error" role="alert">
                      <AlertCircle size={20} className="alert-icon" />
                      <p className="alert-message">{error}</p>
                    </div>
                  )}

                  <div className="form-grid-2">
                    {/* Name */}
                    <div className="form-field">
                      <label htmlFor="quote-name" className="field-label">
                        Your Name <span className="req-star">*</span>
                      </label>
                      <input
                        id="quote-name"
                        type="text"
                        required
                        placeholder="e.g. Maya &amp; Arjun"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="field-input"
                      />
                    </div>

                    {/* Email */}
                    <div className="form-field">
                      <label htmlFor="quote-email" className="field-label">
                        Email Address <span className="req-star">*</span>
                      </label>
                      <input
                        id="quote-email"
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="field-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    {/* Phone / WhatsApp */}
                    <div className="form-field">
                      <label htmlFor="quote-phone" className="field-label">
                        Phone or WhatsApp
                      </label>
                      <input
                        id="quote-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="field-input"
                      />
                    </div>

                    {/* Photoshoot Type */}
                    <div className="form-field">
                      <label htmlFor="quote-type" className="field-label">
                        Photoshoot Type <span className="req-star">*</span>
                      </label>
                      <select
                        id="quote-type"
                        required
                        value={formData.shoot_type}
                        onChange={(e) => setFormData({ ...formData, shoot_type: e.target.value })}
                        className="field-select"
                      >
                        <option value="Wedding Celebrations">Wedding</option>
                        <option value="Pre-Wedding Story">Pre-Wedding Shoot</option>
                        <option value="Post-Wedding Session">Post-Wedding Shoot</option>
                        <option value="Couple Portraits">Couple Shoot</option>
                        <option value="Portraiture">Portraits</option>
                        <option value="Events & Gatherings">Event</option>
                        <option value="Other Photography">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    {/* Preferred Date */}
                    <div className="form-field">
                      <label htmlFor="quote-date" className="field-label">
                        Preferred Date
                      </label>
                      <input
                        id="quote-date"
                        type="text"
                        placeholder="e.g. Dec 2026 or approximate month"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        className="field-input"
                      />
                    </div>

                    {/* Location */}
                    <div className="form-field">
                      <label htmlFor="quote-location" className="field-label">
                        Location / Venue
                      </label>
                      <input
                        id="quote-location"
                        type="text"
                        placeholder="e.g. Udaipur, Goa, Kolkata, International"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="field-input"
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="form-field">
                    <label htmlFor="quote-budget" className="field-label">
                      Estimated Budget Range (Optional)
                    </label>
                    <select
                      id="quote-budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="field-select"
                    >
                      <option value="">Select a range or leave flexible</option>
                      <option value="Under ₹1,50,000">Under ₹1,50,000</option>
                      <option value="₹1,50,000 - ₹3,00,000">₹1,50,000 - ₹3,00,000</option>
                      <option value="₹3,00,000 - ₹6,00,000">₹3,00,000 - ₹6,00,000</option>
                      <option value="₹6,00,000+ (Grand Multi-day Destination)">₹6,00,000+ (Grand Multi-day Destination)</option>
                      <option value="Custom / Inquire">Custom / Request Estimate</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-field">
                    <label htmlFor="quote-message" className="field-label">
                      Message &amp; Vision <span className="req-star">*</span>
                    </label>
                    <textarea
                      id="quote-message"
                      required
                      rows={4}
                      placeholder="Tell me about your planned dates, ceremonies, aesthetic vision, and what matters most to you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="field-textarea"
                    />
                  </div>

                  <p className="privacy-note">
                    Confidential inquiry. Your contact information is never shared or added to mailing lists.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary form-submit-btn"
                  >
                    <span>{loading ? "Sending Quotation Request..." : "Request Quotation"}</span>
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-quote-section {
          padding: clamp(6rem, 10vw, 10rem) 0;
          background-color: var(--bg-primary);
          position: relative;
        }

        .contact-quote-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: clamp(3rem, 6vw, 6.5rem);
          align-items: flex-start;
        }

        /* Left Column */
        .contact-info-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .panel-header {
          display: flex;
          flex-direction: column;
        }

        .contact-title {
          font-size: clamp(2.25rem, 4.2vw, 3.5rem);
          margin-top: 0.5rem;
        }

        .contact-lead {
          font-size: 1.0625rem;
          line-height: 1.75;
          color: var(--text-secondary);
        }

        .channels-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .channel-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.2rem 1.5rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.3s var(--ease-editorial);
          position: relative;
        }

        .channel-box:hover {
          border-color: var(--border-medium);
          background-color: #0E2435;
          transform: translateX(4px);
        }

        .channel-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(216, 186, 132, 0.1);
          color: var(--accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-whatsapp {
          background: rgba(76, 175, 80, 0.12);
          color: #4CAF50;
        }

        .channel-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex-grow: 1;
        }

        .channel-caption {
          font-family: var(--font-sans);
          font-size: 0.6875rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .channel-value {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .channel-arrow {
          color: var(--text-muted);
          transition: transform 0.3s var(--ease-editorial), color 0.3s;
        }

        .channel-box:hover .channel-arrow {
          color: var(--accent-gold);
          transform: translate(2px, -2px);
        }

        .service-location-badge {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          margin-top: 0.5rem;
        }

        .pin-icon {
          color: var(--accent-gold);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .location-text {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .location-head {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .location-sub {
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Right Column: Form Card */
        .quote-form-panel {
          position: relative;
        }

        .form-wrapper-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: clamp(2rem, 5vw, 3.5rem);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .form-card-header {
          margin-bottom: 2rem;
        }

        .quote-kicker {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent-gold);
          font-weight: 600;
          display: block;
          margin-bottom: 0.5rem;
        }

        .form-card-title {
          font-family: var(--font-sans);
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .form-card-desc {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .editorial-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .field-label {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .req-star {
          color: var(--accent-gold);
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          background-color: #061824;
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 0.85rem 1rem;
          font-family: inherit;
          font-size: 0.9375rem;
          border-radius: 2px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 1px var(--accent-gold);
        }

        .field-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A7ADB4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
          cursor: pointer;
        }

        .field-textarea {
          resize: vertical;
          min-height: 110px;
        }

        .privacy-note {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .form-submit-btn {
          width: 100%;
          padding: 1.1rem;
          margin-top: 0.5rem;
          cursor: pointer;
        }

        /* Alerts */
        .form-alert {
          display: flex;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }

        .alert-success {
          background-color: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          color: #81C784;
        }

        .alert-error {
          background-color: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          color: #E57373;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .alert-heading {
          font-family: var(--font-sans);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .alert-message {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .dev-config-note {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(216, 186, 132, 0.08);
          border-left: 2px solid var(--accent-gold);
          color: var(--accent-gold);
          font-size: 0.8125rem;
        }

        .btn-new-inquiry {
          margin-top: 1rem;
          align-self: flex-start;
          padding: 0.6rem 1.25rem;
          font-size: 0.75rem;
        }

        @media (max-width: 960px) {
          .contact-quote-grid {
            grid-template-columns: 1fr;
            gap: 4rem;
          }
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
