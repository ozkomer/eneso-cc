# Cloudflare Pages Deployment Guide - eneso.cc

Bu rehber, eneso.cc projesini Cloudflare Pages'e deploy etmek için adımları içerir.

## Ön Gereksinimler

1. Cloudflare hesabı
2. Wrangler CLI kurulu (`npm install -g wrangler`)
3. Cloudflare'de oturum açmış olmak (`wrangler login`)

## Adım 1: Wrangler ile Giriş Yapın

```bash
wrangler login
```

Bu komut tarayıcınızı açacak ve Cloudflare hesabınıza giriş yapmanızı isteyecektir.

## Adım 2: Projeyi Build Edin

```bash
npm run build
```

## Adım 3: Environment Variables Ayarlayın

Cloudflare Pages Dashboard'da veya Wrangler CLI ile environment variables ekleyin:

### Cloudflare Dashboard'dan:

1. Cloudflare Dashboard'a gidin
2. Pages > eneso-cc projesine gidin
3. Settings > Environment variables
4. Şu değişkenleri ekleyin:
   - `DATABASE_URL` - Supabase connection string
   - `DIRECT_URL` - Direct connection (migrations için)
   - `NEXT_PUBLIC_BASE_URL` (opsiyonel) - https://eneso.cc

### Wrangler CLI ile:

```bash
wrangler pages secret put DATABASE_URL
wrangler pages secret put DIRECT_URL
wrangler pages secret put NEXT_PUBLIC_BASE_URL
```

## Adım 4: Cloudflare Pages Projesi Oluşturun

Cloudflare Dashboard'dan proje oluşturmanız gerekiyor:

1. Cloudflare Dashboard'a gidin: https://dash.cloudflare.com
2. Sol menüden "Workers & Pages" > "Pages" seçin
3. "Create a project" butonuna tıklayın
4. "Upload assets" seçeneğini seçin
5. Proje adını `eneso-cc` olarak girin
6. "Create project" butonuna tıklayın

**VEYA** GitHub repository'yi bağlayarak otomatik deploy yapabilirsiniz (önerilen).

## Adım 5: Deploy Edin

### İlk Deploy (Manuel):

```bash
npm run build
wrangler pages deploy .next --project-name=eneso-cc --commit-dirty=true
```

### Sonraki Deploy'lar:

```bash
npm run deploy
```

**Not:** İlk deploy için Cloudflare Dashboard'dan proje oluşturmanız gerekiyor.

## Adım 5: Custom Domain Ayarlayın (Opsiyonel)

1. Cloudflare Dashboard > Pages > eneso-cc > Custom domains
2. "Set up a custom domain" butonuna tıklayın
3. `eneso.cc` domain'ini ekleyin
4. DNS kayıtlarını Cloudflare otomatik olarak yapılandıracaktır

## GitHub Integration (Otomatik Deploy)

GitHub repository'yi Cloudflare Pages'e bağlayarak otomatik deploy yapabilirsiniz:

1. Cloudflare Dashboard > Pages > Create a project
2. "Connect to Git" seçeneğini seçin
3. GitHub repository'nizi seçin
4. Build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
   - **Root directory:** `eneso.cc` (eğer repo root'unda değilse)

## Troubleshooting

### Prisma Client Hatası

Eğer "Prisma Client not found" hatası alırsanız:

```bash
npm run build
```

Build komutu `prisma generate` çalıştırır, bu yüzden Prisma Client oluşturulur.

### Environment Variables Hatası

Eğer "Missing environment variable" hatası alırsanız:

1. Cloudflare Dashboard'da environment variables'ları kontrol edin
2. Production, Preview ve Development için ayrı ayrı ayarlayın
3. Özel karakterleri URL-encode edin (özellikle şifrelerde)

### Node.js Compatibility

Cloudflare Workers/Pages Node.js API'lerini desteklemez. Prisma için `nodejs_compat` flag'i `wrangler.toml`'de ayarlanmıştır.

## Notlar

- Cloudflare Pages, Next.js API routes'ları destekler
- Edge Runtime kullanılmıyor (Prisma Node.js modülleri gerektirir)
- Build output `.next` klasöründe
- Environment variables production'da otomatik olarak kullanılır

