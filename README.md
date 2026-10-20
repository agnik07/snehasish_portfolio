# Snehasish Dutta Photography Portfolio

A minimal, premium personal photography website for an independent destination wedding and portrait photographer. Built with Next.js 16 (App Router), TypeScript, SQLite via `better-sqlite3`, and a dark editorial design system.

---

## Features

- **Minimal Editorial Aesthetic**:
  - Deep navy-black background (`#03111B`), soft off-white typography (`#F7F7F5`), and restrained muted gold accents (`#D8BA84`).
  - Oversized display typography and asymmetrical photo grids.
- **Single Scrolling Homepage**:
  - **Work**: Curated gallery of high-resolution photographs with category filtering (`All`, `Weddings`, `Couples`, `Portraits`).
  - **Fullscreen Lightbox**: Keyboard navigation (`Esc`, `←`, `→`), responsive touch gestures, captions, and index counter.
  - **About**: Artist narrative, documentary philosophy, service area, and shoot disciplines.
  - **Contact & Get a Quote**: Direct studio channels (Email, WhatsApp, Instagram) and a bespoke quote inquiry form with server validation, duplicate prevention, and automated storage.
- **Private Administrator CMS** (`/admin/login`):
  - Portfolio management: Upload, organize, edit captions, rearrange display order, and publish/unpublish photographs.
  - Inquiry inbox: View incoming quote requests with one-click direct email/WhatsApp response actions.
  - Site settings: Update photographer display name, hero images, tagline, bio, and contact information.
  - Secure authentication with bcrypt hashing, rate limiting, and HTTPOnly signed session tokens.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS tokens & scoped styles (no heavy CSS frameworks)
- **Database**: SQLite via `better-sqlite3` (auto-initialized and seeded on first run)
- **Authentication**: JWT cookies with HTTPOnly & bcrypt password hashing
- **Object Storage**: Compatible with Cloudflare R2 / presigned upload URLs
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build

```bash
npm run build
npm start
```

---

## Private Administrator Credentials

- **Login Route**: `/admin/login`
- **Default Email**: `admin@snehasishphotography.com`
- **Default Password**: `Snehasish@2026!`

*Note: You can change the administrator password or configure your own admin email in the `.env` file or directly in the database.*

---

## Deployment on Vercel

For serverless deployments (such as Vercel), external persistent SQLite database files can be swapped with Supabase / Cloudflare D1 / Turso, and images stored directly on Cloudflare R2 or AWS S3.
