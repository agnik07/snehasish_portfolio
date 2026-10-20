import React from "react";
import { getDb } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WorkGallery, { GalleryPhotoItem } from "@/components/WorkGallery";
import AboutSection from "@/components/AboutSection";
import ContactAndQuote from "@/components/ContactAndQuote";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = getDb();

  // 1. Site Settings
  const settingsRows = db.prepare("SELECT key, value FROM site_settings").all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of settingsRows) {
    settings[r.key] = r.value;
  }

  // 2. Curated Editorial Photographs for Work Gallery
  const photoRows = db.prepare(`
    SELECT pp.id, pp.url, pp.caption, pp.alt_text, pp.aspect_ratio,
           c.name as category_name, p.title as project_title, p.is_featured
    FROM project_photos pp
    JOIN projects p ON pp.project_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_published = 1 AND c.is_active = 1
    ORDER BY p.is_featured DESC, pp.order_index ASC, pp.created_at DESC
  `).all() as Array<{
    id: string;
    url: string;
    caption: string | null;
    alt_text: string | null;
    aspect_ratio: string;
    category_name: string;
    project_title: string;
    is_featured: number;
  }>;

  const galleryPhotos: GalleryPhotoItem[] = photoRows.map((p) => ({
    id: p.id,
    url: p.url,
    title: p.project_title,
    caption: p.caption,
    alt_text: p.alt_text || p.caption || p.project_title,
    category: p.category_name,
    aspect_ratio: (p.aspect_ratio || "landscape") as "portrait" | "landscape" | "square",
    featured: Boolean(p.is_featured),
  }));

  // Hero photography selections
  const heroDominant = settings.hero_image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85";
  const heroSupporting = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85";

  const brandDisplayName = settings.brand_name || settings.photographer_name || "SNEHASISH DUTTA";

  return (
    <main className="editorial-portfolio-root">
      {/* 1. Understated Top Navigation (Work, About, Contact, Get a Quote) */}
      <Navbar brandName={brandDisplayName} />

      {/* 2. Asymmetric Hero: Dominant Portrait on Right, Oversized Name on Bottom-Left */}
      <Hero
        photographerName={brandDisplayName}
        tagline={settings.brand_tagline || settings.hero_subheadline}
        dominantPhotoUrl={heroDominant}
        supportingPhotoUrl={heroSupporting}
      />

      {/* 3. Curated Editorial Gallery with Fullscreen Lightbox */}
      <WorkGallery photos={galleryPhotos} />

      {/* 4. Concise Personal About Section */}
      <AboutSection
        photographerName={settings.photographer_name || "Snehasish Dutta"}
        biography={settings.photographer_bio}
        photographyStyle={settings.photographer_philosophy}
        serviceArea={settings.service_area}
        portraitUrl={settings.photographer_portrait_url}
      />

      {/* 5. Contact Channels & Tailored Quote Inquiry Form */}
      <ContactAndQuote
        contactEmail={settings.contact_email}
        whatsappPhone={settings.whatsapp_phone}
        instagramUrl={settings.instagram_url}
        serviceArea={settings.service_area}
      />

      {/* 6. Minimal Footer with Discreet Admin Portal */}
      <Footer
        brandName={brandDisplayName}
        tagline={settings.brand_tagline}
        contactEmail={settings.contact_email}
        whatsappPhone={settings.whatsapp_phone}
        instagramUrl={settings.instagram_url}
        privacyText={settings.privacy_policy_text}
        termsText={settings.terms_text}
      />
    </main>
  );
}
