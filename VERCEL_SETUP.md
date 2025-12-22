# Vercel'ga Deploy Qilish - To'liq Qo'llanma

## ✅ Javob: Ha, Vercel'ga deploy qilgandan keyin Apple Pay'ni test qilishingiz mumkin!

Vercel:

- ✅ **HTTPS** avtomatik beradi (Apple Pay uchun kerak)
- ✅ **SSL sertifikati** avtomatik beradi
- ✅ **Static files** serve qiladi (`.well-known` papkasi uchun)
- ✅ **Domain verification** faylini serve qiladi

## QADAM 1: `.well-known` Papkasini Tayyorlash

### 1.1. Papka Yaratish

```bash
cd strapi4_test
mkdir -p public/.well-known
```

### 1.2. Apple Pay Domain Verification Faylini Qo'yish

1. **Payone dan fayl oling:**

   - Payone PMI (Payment Method Integration) ga kiring
   - **KONFIGURATSIYA** > **PLATYEZHNYE PORTALY** > Portal tanlang
   - Apple Pay bo'limida **"Domain Verification File"** ni yuklab oling
   - Fayl nomi: `apple-developer-merchantid-domain-association` (extension yo'q!)

2. **Faylni qo'ying:**

   ```
   public/.well-known/apple-developer-merchantid-domain-association
   ```

3. **Fayl strukturasini tekshiring:**
   ```
   strapi4_test/
   ├── public/
   │   ├── .well-known/
   │   │   └── apple-developer-merchantid-domain-association  ← Bu fayl
   │   ├── robots.txt
   │   └── uploads/
   ```

**Muhim:**

- Fayl nomi to'liq bo'lishi kerak: `apple-developer-merchantid-domain-association`
- Extension bo'lmasligi kerak (`.txt` yoki boshqa extension yo'q)
- Fayl `public/.well-known/` papkasida bo'lishi kerak

## QADAM 2: Vercel'ga Deploy

### 2.1. Vercel CLI O'rnatish

```bash
npm install -g vercel
```

### 2.2. Vercel'ga Login

```bash
vercel login
```

### 2.3. Deploy Qilish

```bash
cd strapi4_test
vercel
```

**Yoki Vercel Dashboard orqali:**

1. [vercel.com](https://vercel.com) ga kiring
2. **New Project** ni bosing
3. GitHub repository'ni tanlang yoki import qiling
4. **Deploy** ni bosing

### 2.4. Production Deploy

```bash
vercel --prod
```

## QADAM 3: Environment Variables

Vercel Dashboard > **Project Settings** > **Environment Variables**:

### 3.1. Strapi Core Variables (MUST HAVE)

```bash
APP_KEYS=key1,key2,key3,key4
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
API_TOKEN_SALT=your-api-token-salt-here
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here
```

**Qanday yaratish:**

```bash
# Local'da .env faylidan oling yoki yangi yarating:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3.2. Database Variables

**Vercel Postgres ishlatayotgan bo'lsangiz:**

```bash
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**Yoki boshqa database:**

```bash
DATABASE_CLIENT=mysql
DATABASE_HOST=your-host
DATABASE_PORT=3306
DATABASE_NAME=your-db
DATABASE_USERNAME=your-user
DATABASE_PASSWORD=your-pass
```

### 3.3. Server Variables

```bash
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
SERVER_URL=https://your-project.vercel.app  # ⚠️ Vercel domain'ingizga o'zgartiring!
```

**Muhim:** `SERVER_URL` ni Vercel domain'ingizga o'zgartiring!

### 3.4. Payone Plugin Variables (Ixtiyoriy)

```bash
PAYONE_AID=your-aid
PAYONE_MID=your-mid
PAYONE_PORTAL_ID=your-portal-id
PAYONE_PORTAL_KEY=your-key
PAYONE_MODE=test
```

**Yoki Admin panel'da sozlashingiz mumkin:**

- Plugins > Payone Provider > Settings

## QADAM 4: Domain Verification Test

### 4.1. Deploy Qilgandan Keyin

1. **Vercel domain'ingizni oling:**

   - Vercel Dashboard > Project > Domains
   - Masalan: `https://your-project.vercel.app`

2. **Domain verification faylini test qiling:**

   ```
   https://your-project.vercel.app/.well-known/apple-developer-merchantid-domain-association
   ```

3. **Kutilayotgan natija:**
   - ✅ Fayl yuklanishi kerak
   - ✅ Text content ko'rinishi kerak
   - ✅ 200 OK status
   - ❌ 404 Not Found bo'lmasligi kerak
   - ❌ Authentication so'ralmasligi kerak

### 4.2. Agar 404 Xatosi Bo'lsa

**Yechim 1: vercel.json ni tekshiring**

`vercel.json` da `.well-known` route to'g'ri sozlanganligini tekshiring:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/.well-known/(.*)",
      "dest": "/public/.well-known/$1",
      "headers": {
        "Content-Type": "text/plain"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Yechim 2: Fayl Git'ga Commit Qiling**

Fayl git'ga commit qilinganligini tekshiring:

```bash
git add public/.well-known/apple-developer-merchantid-domain-association
git commit -m "Add Apple Pay domain verification file"
git push
```

**Yechim 3: Vercel'da Rebuild**

Vercel Dashboard > Deployments > Latest > **Redeploy**

## QADAM 5: Apple Pay Test Qilish

### 5.1. Admin Panel'ga Kirish

1. **Vercel domain'ingizga kiring:**

   ```
   https://your-project.vercel.app/admin
   ```

2. **Login qiling** (agar kerak bo'lsa)

### 5.2. Payone Plugin Sozlash

1. **Plugins > Payone Provider > Settings:**

   - AID
   - MID
   - Portal ID
   - Portal Key
   - Mode (test yoki live)

2. **Save** ni bosing

### 5.3. Apple Pay Test

1. **Test Actions tab'ga o'ting**

2. **Payment Method:** Apple Pay ni tanlang

3. **Amount:** Kiriting (masalan: `1000` = €10.00)

4. **Reference:** Kiriting yoki bo'sh qoldiring (avtomatik yaratiladi)

5. **Apple Pay buttonini bosing**

6. **Kutilayotgan natija:**
   - ✅ Apple Pay button ko'rsatiladi
   - ✅ Payment sheet ochiladi (Safari/Mac'da)
   - ✅ Token olinadi
   - ✅ Preauthorization request yuboriladi
   - ✅ Payone'dan javob keladi

## QADAM 6: Custom Domain (Ixtiyoriy)

### 6.1. Custom Domain Qo'shish

1. **Vercel Dashboard > Project Settings > Domains**

2. **Add Domain:**

   - `yourdomain.com`
   - `www.yourdomain.com`

3. **DNS Sozlamalari:**
   - Vercel'ning DNS recordlarini domain provider'ga qo'shing
   - A record yoki CNAME record

### 6.2. Domain Verification Faylini Yangilash

1. **Yangi domain uchun Payone dan fayl oling**

2. **Faylni yangilang:**

   ```
   public/.well-known/apple-developer-merchantid-domain-association
   ```

3. **Commit va Deploy:**

   ```bash
   git add public/.well-known/apple-developer-merchantid-domain-association
   git commit -m "Update domain verification for custom domain"
   git push
   ```

4. **Test qiling:**
   ```
   https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
   ```

## QADAM 7: Build Sozlamalari

### 7.1. Build Command

Vercel avtomatik ravishda `npm run build` ni ishga tushiradi.

**package.json:**

```json
{
  "scripts": {
    "build": "strapi build"
  }
}
```

### 7.2. Build Time

- **Birinchi build:** 5-10 minut (dependencies o'rnatiladi)
- **Keyingi build'lar:** 2-5 minut

### 7.3. Build Logs

Vercel Dashboard > Deployments > Build Logs da build jarayonini ko'rishingiz mumkin.

## QADAM 8: Xatolar va Yechimlar

### Xato: "Domain verification file not found"

**Sabab:** Fayl to'g'ri serve qilinmayapti

**Yechim:**

1. Fayl `public/.well-known/apple-developer-merchantid-domain-association` da bo'lishi kerak
2. Fayl nomi to'liq bo'lishi kerak (extension yo'q)
3. Git'ga commit qilinganligini tekshiring
4. Vercel'da rebuild qiling

### Xato: "404 Not Found" `.well-known` uchun

**Sabab:** Route to'g'ri sozlanmagan

**Yechim:**

1. `vercel.json` da route to'g'ri sozlanganligini tekshiring (hozirgi kodga mos)
2. `public/.well-known` papkasi mavjudligini tekshiring
3. `api/index.js` fayli mavjudligini tekshiring
4. Vercel'da rebuild qiling

### Xato: "Apple Pay is not available"

**Sabab:** Domain verification yoki merchant identifier muammosi

**Yechim:**

1. Domain verification faylini tekshiring
2. Payone sozlamalarini tekshiring
3. Browser console'da xatolarni tekshiring
4. Network tab'da request'larni tekshiring

### Xato: "CSP (Content Security Policy) error"

**Sabab:** CSP sozlamalari Apple Pay SDK'ni bloklayapti

**Yechim:**

1. `config/middlewares.js` da CSP sozlamalarini tekshiring
2. `config/admin.js` da CSP sozlamalarini tekshiring
3. Apple Pay SDK domain'lariga ruxsat bering:
   - `https://applepay.cdn-apple.com`
   - `https://www.apple.com`

## QADAM 9: Production'ga O'tkazish

### 9.1. Payone Mode'ni O'zgartirish

1. **Vercel Environment Variables:**

   ```
   PAYONE_MODE=live
   ```

2. **Yoki Admin Panel:**
   - Plugins > Payone Provider > Settings
   - Mode'ni "live" ga o'zgartiring

### 9.2. SSL Sertifikati

Vercel avtomatik ravishda SSL sertifikati beradi. Qo'shimcha sozlash kerak emas.

### 9.3. Domain Verification

Production domain uchun domain verification faylini yangilang.

## Foydali Linklar

- [Vercel Documentation](https://vercel.com/docs)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Apple Pay Integration](https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev)

## Xulosa

✅ **Ha, Vercel'ga deploy qilgandan keyin Apple Pay'ni test qilishingiz mumkin!**

**Vercel'ning afzalliklari:**

- ✅ HTTPS avtomatik (Apple Pay uchun kerak)
- ✅ SSL sertifikati avtomatik
- ✅ Static files serve qiladi
- ✅ `.well-known` papkasini qo'llab-quvvatlaydi
- ✅ Custom domain qo'shish oson
- ✅ Environment variables oson sozlash

**Qadama-qadam:**

1. ✅ `.well-known` papkasini yarating
2. ✅ Domain verification faylini qo'ying
3. ✅ Vercel'ga deploy qiling
4. ✅ Environment variables sozlang
5. ✅ Domain verification test qiling
6. ✅ Apple Pay test qiling

**Muvaffaqiyatli deploy va test qiling!** 🚀
