# eneso.cc - Link Shortener & Tracking Service

Minimal Next.js proxy service for link shortening and click tracking.

## Features

- **Link Redirect**: `/l/[slug]` endpoint redirects to original URLs
- **Click Tracking**: Tracks IP, geolocation, device, browser, referrer
- **Database**: Uses same Supabase database as admin panel
- **Performance**: Fast redirects with async tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

Server will run on `http://localhost:4003`

## Deployment

Deploy to Vercel or Cloudflare Pages. Make sure to set environment variables:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_BASE_URL` (optional, defaults to https://eneso.cc)

## Usage

Access links via: `https://eneso.cc/l/[shortUrl]`

The service will:
1. Find the link by `shortUrl`
2. Track the click (async)
3. Redirect to `originalUrl`

