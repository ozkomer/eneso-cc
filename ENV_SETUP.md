# Environment Variables Kurulumu

## ✅ Deploy Başarılı!

Proje başarıyla Cloudflare Pages'e deploy edildi:
- **URL:** https://1744aafa.eneso-cc.pages.dev
- **Production URL:** https://eneso-cc.pages.dev (ilk deployment sonrası aktif olacak)

## 🔧 Environment Variables Ekleyin

Deploy başarılı ama environment variables eklemeniz gerekiyor. İki yöntem var:

### Yöntem 1: Cloudflare Dashboard (Önerilen)

1. https://dash.cloudflare.com adresine gidin
2. **Workers & Pages** > **Pages** > **eneso-cc** projesine gidin
3. **Settings** sekmesine gidin
4. **Environment variables** bölümüne gidin
5. Şu değişkenleri ekleyin:

   **Production:**
   - `DATABASE_URL` = `[Supabase connection string]`
   - `DIRECT_URL` = `[Direct connection string]`
   - `NEXT_PUBLIC_BASE_URL` = `https://eneso.cc` (opsiyonel)

   **Preview ve Development için de aynı değişkenleri ekleyin.**

6. **Save** butonuna tıklayın
7. Yeni bir deployment tetikleyin (tekrar deploy edin)

### Yöntem 2: Wrangler CLI (Secret olarak)

```bash
# Production için
wrangler pages secret put DATABASE_URL --project-name=eneso-cc
wrangler pages secret put DIRECT_URL --project-name=eneso-cc
wrangler pages secret put NEXT_PUBLIC_BASE_URL --project-name=eneso-cc
```

**Not:** Secrets sadece production için geçerlidir. Preview ve Development için Dashboard'dan eklemeniz gerekir.

## 🚀 Tekrar Deploy

Environment variables ekledikten sonra:

```bash
npm run deploy
```

veya

```bash
npm run build
wrangler pages deploy .next --project-name=eneso-cc
```

## 📝 Test

Environment variables eklendikten sonra test edin:

```
https://eneso-cc.pages.dev/l/test-kulakık-testy
```

Bu URL çalışmalı ve veritabanına bağlanabilmelidir.


