# eneso.cc - Link Shortener & Tracking Proxy

## Proje Amacı
Bu proje, affiliate link'leri kısa URL'lere dönüştüren ve tıklamaları takip eden bir proxy servisidir.

## Teknik Yapı

### 1. Proje Yapısı
```
eneso.cc/
├── app/
│   ├── l/
│   │   └── [slug]/
│   │       └── route.ts      # Link redirect ve tracking
│   ├── layout.tsx            # Minimal layout
│   └── page.tsx              # Ana sayfa (opsiyonel, redirect için)
├── lib/
│   └── prisma.ts            # Prisma client (aynı DB)
├── prisma/
│   └── schema.prisma        # Sadece gerekli modeller
└── package.json
```

### 2. Özellikler

#### Link Redirect (`/l/[slug]`)
- `shortUrl` ile link bulma
- Aktif link kontrolü
- Click tracking:
  - IP adresi
  - User Agent
  - Referrer
  - Geolocation (ülke, şehir)
  - Device (mobile, tablet, desktop)
  - Browser (Chrome, Firefox, Safari, vb.)
- Click count artırma
- Original URL'e redirect

#### Veritabanı
- Aynı Supabase veritabanını kullanacak
- `AffiliateLink` modeli (read-only)
- `Click` modeli (write)
- Minimal Prisma schema

#### Performans
- Hızlı redirect (geolocation async)
- Error handling
- 404 sayfası (link bulunamazsa)

### 3. Environment Variables
```env
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_BASE_URL=https://eneso.cc
```

### 4. Deployment
- Vercel veya Cloudflare Pages
- Minimal build size
- Edge runtime (opsiyonel)

## Akış Şeması

```
User clicks: https://eneso.cc/l/abc123
    ↓
1. Find link by shortUrl
    ↓
2. Check if active
    ↓
3. Track click (async):
   - Get IP, User Agent, Referrer
   - Get Geolocation
   - Detect Device & Browser
   - Save to Click table
   - Increment clickCount
    ↓
4. Redirect to originalUrl
```

## Güvenlik
- Rate limiting (opsiyonel)
- Bot detection (opsiyonel)
- IP blocking (opsiyonel)





