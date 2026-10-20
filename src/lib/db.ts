import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

function getDatabasePath(): string {
  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel) {
    const tmpDbPath = path.join("/tmp", "portfolio.db");
    if (!fs.existsSync(tmpDbPath)) {
      const bundledPath = path.join(process.cwd(), "data", "portfolio.db");
      if (fs.existsSync(bundledPath)) {
        try {
          fs.copyFileSync(bundledPath, tmpDbPath);
        } catch (err) {
          console.warn("[Vercel DB]: Could not copy bundled DB to /tmp, will initialize from code:", err);
        }
      }
    }
    return tmpDbPath;
  }

  const localDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      // ignore if exists
    }
  }
  return path.join(localDir, "portfolio.db");
}

// Singleton connection
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDatabasePath();
    dbInstance = new Database(dbPath);
    try {
      dbInstance.pragma("journal_mode = WAL");
    } catch {
      // WAL mode may fallback on some virtual environments
    }
    dbInstance.pragma("foreign_keys = ON");
    initSchema(dbInstance);
    seedData(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token_hash TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id TEXT NOT NULL,
      client_names TEXT,
      location TEXT,
      shoot_date TEXT,
      cover_image_url TEXT NOT NULL,
      description TEXT,
      is_featured INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS project_photos (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      alt_text TEXT,
      width INTEGER DEFAULT 1600,
      height INTEGER DEFAULT 1067,
      aspect_ratio TEXT DEFAULT 'landscape',
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      starting_price TEXT,
      cover_image_url TEXT,
      inclusions TEXT, -- JSON array of strings
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      shoot_type TEXT NOT NULL,
      quote TEXT NOT NULL,
      image_url TEXT,
      is_published INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      shoot_type TEXT NOT NULL,
      preferred_date TEXT,
      location TEXT,
      budget TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new', -- 'new', 'contacted', 'booked', 'archived'
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
    CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published, order_index);
    CREATE INDEX IF NOT EXISTS idx_project_photos_project ON project_photos(project_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status, created_at);
  `);
}

function seedData(db: Database.Database) {
  // 1. Seed Admin
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count: number };
  if (adminCount.count === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@snehasishphotography.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Snehasish@2026!";
    const passwordHash = bcrypt.hashSync(adminPassword, 12);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admins (id, email, password_hash, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "admin_1",
      adminEmail.toLowerCase(),
      passwordHash,
      "Snehasish Dutta",
      now,
      now
    );
  }

  // 2. Seed Categories
  const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (categoryCount.count === 0) {
    const now = new Date().toISOString();
    const categories = [
      { id: "cat_weddings", name: "Weddings", slug: "weddings", description: "Timeless ceremonies, heartfelt rituals, and grand celebrations.", order: 1 },
      { id: "cat_prewedding", name: "Pre-Wedding", slug: "pre-wedding", description: "Cinematic, intimate couple stories crafted across sublime landscapes.", order: 2 },
      { id: "cat_postwedding", name: "Post-Wedding", slug: "post-wedding", description: "Relaxed, newlywed portraits celebrating your beginning.", order: 3 },
      { id: "cat_engagements", name: "Engagement & Couples", slug: "engagements", description: "Raw tenderness, genuine smiles, and unscripted intimacy.", order: 4 },
      { id: "cat_portraits", name: "Portraits", slug: "portraits", description: "Soulful individual portraiture and artistic character studies.", order: 5 },
      { id: "cat_editorial", name: "Fashion & Editorial", slug: "fashion-editorial", description: "Bold concepts, dramatic lighting, and avant-garde visuals.", order: 6 },
      { id: "cat_events", name: "Events & Celebrations", slug: "events", description: "Sangeet nights, anniversaries, and high-energy gatherings.", order: 7 },
      { id: "cat_other", name: "Other Photography", slug: "other", description: "Fine art experiments, architectural frames, and travel studies.", order: 8 },
    ];

    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, order_index, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `);

    for (const c of categories) {
      insertCat.run(c.id, c.name, c.slug, c.description, c.order, now, now);
    }
  }

  // 3. Seed Site Settings
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
  if (settingsCount.count === 0) {
    const defaultSettings: Record<string, string> = {
      brand_name: "SNEHASISH DUTTA",
      brand_tagline: "Fine Art & Documentary Wedding Photography",
      hero_headline: "Stories, Honestly Told Through Light.",
      hero_subheadline: "Documenting weddings, human connection, and raw emotion across India and worldwide destinations with an editorial eye.",
      hero_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=85",
      hero_cta_work_text: "Explore Stories",
      hero_cta_book_text: "Book a Shoot",
      photographer_name: "Snehasish Dutta",
      photographer_bio: "I am an independent fine art and documentary photographer based in Kolkata, traveling across Rajasthan, Goa, Mumbai, and international destinations. My work honors the sacred, unhurried beauty of human connection. Rather than orchestrating artificial poses, I observe with patience—preserving the subtle glances, laughter, tears, and poetry of your most meaningful days.",
      photographer_philosophy: "Every photograph is a time capsule. Thirty years from now, when you open your wedding gallery, the images should bring back the scent of marigolds, the tremor in your voice during vows, and the warmth of a loved one's embrace. I create photographs that remain emotionally resonant across generations.",
      photographer_portrait_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
      service_area: "Kolkata, Udaipur, Jaipur, Goa, Mumbai, Delhi & Worldwide",
      contact_email: "contact@snehasishphotography.com",
      whatsapp_phone: "+91 98765 43210",
      instagram_url: "https://instagram.com",
      show_testimonials: "true",
      privacy_policy_text: "Your privacy is deeply important to us. All information provided via inquiry forms is treated with strict confidentiality and is used exclusively for booking correspondence.",
      terms_text: "Dates are reserved upon signature of mutual photography contract and 40% initial retainer. Final curated galleries delivered within 4 to 6 weeks.",
      copyright_notice: "© 2026 Snehasish Dutta Photography. All rights reserved."
    };

    const insertSetting = db.prepare(`
      INSERT INTO site_settings (key, value) VALUES (?, ?)
    `);

    for (const [key, value] of Object.entries(defaultSettings)) {
      insertSetting.run(key, value);
    }
  }

  // 4. Seed Services
  const servicesCount = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number };
  if (servicesCount.count === 0) {
    const now = new Date().toISOString();
    const services = [
      {
        id: "srv_wedding",
        name: "The Wedding Story",
        slug: "wedding-story",
        description: "Comprehensive 2 to 3-day documentary and fine-art coverage for your celebrations. From intimate haldi ceremonies and vibrant sangeets to the sacred wedding rituals and reception.",
        starting_price: "Contact for bespoke quotation",
        cover_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
        inclusions: JSON.stringify([
          "Snehasish + associate lead photographer team",
          "Comprehensive multi-day coverage (Haldi, Mehendi, Sangeet, Wedding, Reception)",
          "Curated private online gallery with high-resolution downloads",
          "600+ masterfully color-graded high-resolution images",
          "Signature handcrafted fine-art linen heirloom album",
          "Fast-turnaround sneak peek highlights within 48 hours"
        ]),
        order: 1
      },
      {
        id: "srv_prewedding",
        name: "Pre-Wedding & Destination Editorial",
        slug: "pre-wedding-editorial",
        description: "A relaxed, cinematic visual narrative set against striking natural landscapes or historic architecture. Focused entirely on your unique chemistry without wedding-day time pressure.",
        starting_price: "Contact for bespoke quotation",
        cover_image_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80",
        inclusions: JSON.stringify([
          "Full-day or two-day curated location experience",
          "Wardrobe styling and moodboard consultation",
          "70+ masterfully retouched editorial photographs",
          "Private online gallery & print licensing",
          "Travel and lodging arranged flexibly across India or overseas"
        ]),
        order: 2
      },
      {
        id: "srv_portraiture",
        name: "Fine Art Portraiture & Couples",
        slug: "fine-art-portraiture",
        description: "Intimate, soul-stirring individual portraits, anniversary shoots, and engagement sessions crafted with natural light and intentional shadow.",
        starting_price: "Contact for bespoke quotation",
        cover_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80",
        inclusions: JSON.stringify([
          "2 to 3 hour personalized shoot session",
          "Location scouting (studio, home sanctuary, or outdoor)",
          "35+ hand-retouched fine-art photographs",
          "High-resolution digital gallery with full personal usage rights"
        ]),
        order: 3
      },
      {
        id: "srv_events",
        name: "Intimate Events & Celebrations",
        slug: "intimate-events",
        description: "Discreet documentary coverage for milestone anniversaries, private family dinners, engagement parties, and artistic gatherings.",
        starting_price: "Contact for bespoke quotation",
        cover_image_url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80",
        inclusions: JSON.stringify([
          "Hourly or half-day dedicated coverage",
          "Candid, unobtrusive storytelling of guests and moments",
          "Full color-graded digital gallery delivered in 14 days"
        ]),
        order: 4
      }
    ];

    const insertSrv = db.prepare(`
      INSERT INTO services (id, name, slug, description, starting_price, cover_image_url, inclusions, order_index, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    for (const s of services) {
      insertSrv.run(s.id, s.name, s.slug, s.description, s.starting_price, s.cover_image_url, s.inclusions, s.order, now, now);
    }
  }

  // 5. Seed Testimonials
  const testCount = db.prepare("SELECT COUNT(*) as count FROM testimonials").get() as { count: number };
  if (testCount.count === 0) {
    const now = new Date().toISOString();
    const testimonials = [
      {
        id: "test_1",
        client_name: "Aarav & Meera",
        shoot_type: "Palace Wedding, Udaipur",
        quote: "Snehasish doesn't just take pictures; he captures the soul of the moment. Looking through our gallery made us laugh, cry, and relive every heartbeat of our Udaipur wedding. His calm presence kept us at total ease.",
        order: 1
      },
      {
        id: "test_2",
        client_name: "Kabir & Tanya",
        shoot_type: "Pre-Wedding Session, South Goa",
        quote: "Neither of us liked being in front of the camera, but Snehasish turned our shoot into an effortless evening walk on the beach. The photos feel like stills from a classic art film.",
        order: 2
      },
      {
        id: "test_3",
        client_name: "Debottam & Shreya",
        shoot_type: "Traditional Bengali Wedding, Kolkata",
        quote: "Snehasish respected every intimate family ritual with grace and quiet observation. The heirloom album he designed is our most treasured family possession.",
        order: 3
      }
    ];

    const insertTest = db.prepare(`
      INSERT INTO testimonials (id, client_name, shoot_type, quote, image_url, is_published, order_index, created_at)
      VALUES (?, ?, ?, ?, NULL, 1, ?, ?)
    `);

    for (const t of testimonials) {
      insertTest.run(t.id, t.client_name, t.shoot_type, t.quote, t.order, now);
    }
  }

  // 6. Seed Projects and Curated Multi-Photo Sequences
  const projectCount = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
  if (projectCount.count === 0) {
    const now = new Date().toISOString();

    const sampleProjects = [
      {
        id: "proj_1",
        title: "Heirloom Whispers at Jagmandir Island Palace",
        slug: "heirloom-whispers-udaipur",
        category_id: "cat_weddings",
        client_names: "Aarav & Meera",
        location: "Udaipur, Rajasthan",
        shoot_date: "November 2025",
        cover_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85",
        description: "Set against the tranquil waters of Lake Pichola, Aarav and Meera's wedding brought together centuries-old Rajasthani royal heritage with quiet, contemporary intimacy. Every frame balances the grand marble architecture with spontaneous, candid tears and laughter between two families.",
        is_featured: 1,
        order: 1,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85",
            caption: "Twilight ceremony beneath the hand-carved stone arches overlooking Lake Pichola.",
            alt_text: "Wedding ceremony under palace arches at dusk",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85",
            caption: "The quiet anticipation of bridal adornments and family blessings.",
            alt_text: "Bridal portrait with traditional jewelry and veil",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          },
          {
            url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=85",
            caption: "The sacred phere vows illuminated by temple flame and warm candlelight.",
            alt_text: "Sacred fire and wedding rituals",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=85",
            caption: "A private embrace in the palace corridors as the celebrations echo in the distance.",
            alt_text: "Couple sharing a private moment in the corridor",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          },
          {
            url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=2000&q=85",
            caption: "Vibrant flower showers and joyful laughter under the stars.",
            alt_text: "Celebratory flower petal shower",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          }
        ]
      },
      {
        id: "proj_2",
        title: "Tides and Golden Horizons: A Coastal Solitude",
        slug: "coastal-solitude-goa",
        category_id: "cat_prewedding",
        client_names: "Kabir & Tanya",
        location: "Cabo de Rama, South Goa",
        shoot_date: "January 2026",
        cover_image_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=2000&q=85",
        description: "An unhurried pre-wedding escape where the Arabian Sea meets weathered red laterite cliffs. Kabir and Tanya wanted no stiff poses or matching outfits—just ocean breeze, bare feet in the sand, and the raw poetry of being young and in love.",
        is_featured: 1,
        order: 2,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=2000&q=85",
            caption: "Wind-whipped cliffs at golden hour as the tide recedes.",
            alt_text: "Couple standing on sea cliff during sunset",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=85",
            caption: "Gentle laughter and genuine connection amidst ocean mist.",
            alt_text: "Close-up of couple laughing together",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          },
          {
            url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=2000&q=85",
            caption: "Soft silhouettes framed by the setting sun on the horizon.",
            alt_text: "Sunset silhouette on the beach",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1600&q=85",
            caption: "Quiet stillness in twilight tones.",
            alt_text: "Couple embracing in twilight",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          }
        ]
      },
      {
        id: "proj_3",
        title: "Echoes of Bengal: Crimson Silks & Vintage Courtyards",
        slug: "echoes-of-bengal-kolkata",
        category_id: "cat_weddings",
        client_names: "Debottam & Shreya",
        location: "Bawali Rajbari, West Bengal",
        shoot_date: "December 2025",
        cover_image_url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=2000&q=85",
        description: "An homage to timeless Bengali culture within the 300-year-old arches of Bawali Rajbari. Red Benarasi silk, the scent of fresh tuberose (rajnigandha), intricate chandan art, and the reverberation of conch shells welcoming the union of soulmates.",
        is_featured: 1,
        order: 3,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=2000&q=85",
            caption: "Shreya looking through the betel leaves in the timeless ritual of Shubho Drishti.",
            alt_text: "Bride holding betel leaves during Shubho Drishti",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85",
            caption: "Intricate sandalwood art and vintage gold heirloom necklace.",
            alt_text: "Detail portrait of bride's jewelry and sandalwood art",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          },
          {
            url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=85",
            caption: "The sacred Sindoor Daan moment capturing overwhelming tears of joy.",
            alt_text: "Sindoor ceremony emotional moment",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=85",
            caption: "Ancient colonnades illuminated by oil lamps at the Rajbari.",
            alt_text: "Colonnades of heritage mansion with oil lamps",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          }
        ]
      },
      {
        id: "proj_4",
        title: "Monochrome Study: High-Contrast Editorial",
        slug: "monochrome-study-editorial",
        category_id: "cat_editorial",
        client_names: "Studio Experiment & Fashion Editorial",
        location: "Worli, Mumbai",
        shoot_date: "February 2026",
        cover_image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85",
        description: "An intentional study in light, form, and shadow. Stripping away color forces the viewer to focus on texture, geometry, posture, and expressive eye contact. Created with minimal continuous softboxes and vintage prime lenses.",
        is_featured: 1,
        order: 4,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85",
            caption: "Architectural silhouette against morning skylight.",
            alt_text: "Editorial fashion silhouette in monochrome",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85",
            caption: "Chiaroscuro study focusing on natural facial topography.",
            alt_text: "Dramatic portrait with strong directional shadow",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          },
          {
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85",
            caption: "Flowing textiles and sculptural lines.",
            alt_text: "Textile movement and fabric drape",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          }
        ]
      },
      {
        id: "proj_5",
        title: "Amer Ramparts & The Amber Glow",
        slug: "amer-ramparts-jaipur",
        category_id: "cat_engagements",
        client_names: "Rohan & Ananya",
        location: "Amer Fort & Panna Meena Ka Kund, Jaipur",
        shoot_date: "October 2025",
        cover_image_url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=85",
        description: "Waking before sunrise to capture the morning mist over the Aravali hills. Rohan and Ananya explored the symmetrical stairwells and sandstone arches of Jaipur, basking in the warm golden light that has inspired artists for centuries.",
        is_featured: 0,
        order: 5,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=85",
            caption: "Sandstone corridors bathed in early dawn amber light.",
            alt_text: "Historic fortress corridors in dawn light",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=85",
            caption: "Unrehearsed laughter on the fort battlements.",
            alt_text: "Couple laughing on the fort walls",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          },
          {
            url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85",
            caption: "Framed within the jharokha window overlooking Maota Lake.",
            alt_text: "Portrait framed by fortress window",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          }
        ]
      },
      {
        id: "proj_6",
        title: "Ganga Aarti & Ghat Mysticism: A Portrait Study",
        slug: "ganga-aarti-varanasi-study",
        category_id: "cat_portraits",
        client_names: "Personal Fine Art Series",
        location: "Assi Ghat & Manikarnika, Varanasi",
        shoot_date: "January 2026",
        cover_image_url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2000&q=85",
        description: "A meditative travel and character portraiture essay documented along the sacred ghats of Kashi. Fire, incense, bells, morning fog, and the serene faces of pilgrims and boatmen whose lives move with the eternal rhythm of Mother Ganga.",
        is_featured: 0,
        order: 6,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2000&q=85",
            caption: "Boat gliding through the morning fog across the sacred river.",
            alt_text: "Wooden boat in morning fog on the Ganges",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          },
          {
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85",
            caption: "Eyes carrying centuries of quiet devotion and wisdom.",
            alt_text: "Portrait of local resident with deep expressive gaze",
            aspect_ratio: "portrait",
            width: 1200,
            height: 1600
          },
          {
            url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=85",
            caption: "Evening Maha Aarti flaming brass lamps against the darkening sky.",
            alt_text: "Priests performing evening aarti ceremony with fire",
            aspect_ratio: "landscape",
            width: 2000,
            height: 1333
          }
        ]
      }
    ];

    const insertProj = db.prepare(`
      INSERT INTO projects (id, title, slug, category_id, client_names, location, shoot_date, cover_image_url, description, is_featured, is_published, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    const insertPhoto = db.prepare(`
      INSERT INTO project_photos (id, project_id, url, caption, alt_text, width, height, aspect_ratio, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of sampleProjects) {
      insertProj.run(
        p.id,
        p.title,
        p.slug,
        p.category_id,
        p.client_names,
        p.location,
        p.shoot_date,
        p.cover_image_url,
        p.description,
        p.is_featured,
        p.order,
        now,
        now
      );

      p.photos.forEach((photo, idx) => {
        insertPhoto.run(
          `${p.id}_photo_${idx + 1}`,
          p.id,
          photo.url,
          photo.caption,
          photo.alt_text,
          photo.width,
          photo.height,
          photo.aspect_ratio,
          idx + 1,
          now
        );
      });
    }
  }
}
