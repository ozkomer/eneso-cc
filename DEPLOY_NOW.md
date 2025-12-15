# Hızlı Deploy Talimatları

## 1. Cloudflare Dashboard'dan Proje Oluşturun

1. https://dash.cloudflare.com adresine gidin
2. Sol menüden **"Workers & Pages"** > **"Pages"** seçin
3. **"Create a project"** butonuna tıklayın
4. **"Upload assets"** seçeneğini seçin
5. Proje adını `eneso-cc` olarak girin
6. **"Create project"** butonuna tıklayın

## 2. Environment Variables Ekleyin

Proje oluşturulduktan sonra:

1. Proje sayfasında **"Settings"** sekmesine gidin
2. **"Environment variables"** bölümüne gidin
3. Şu değişkenleri ekleyin:
   - `DATABASE_URL` - Supabase connection string
   - `DIRECT_URL` - Direct connection string
   - `NEXT_PUBLIC_BASE_URL` (opsiyonel) - https://eneso.cc

**Önemli:** Production, Preview ve Development için ayrı ayrı ekleyin.

## 3. Deploy Edin

```bash
npm run deploy
```

Bu komut:
1. Projeyi build eder
2. Cloudflare Pages'e deploy eder

## Alternatif: GitHub Integration (Önerilen)

1. Cloudflare Dashboard > Pages > Create a project
2. **"Connect to Git"** seçeneğini seçin
3. GitHub repository'nizi seçin
4. Build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
   - **Root directory:** `eneso.cc` (eğer repo root'unda değilse)

Bu şekilde her push'ta otomatik deploy yapılır.

