# Strapi 4 ni Vercel'ga Deploy Qilish - AAMAX Maqolasi Asosida

Bu qo'llanma [AAMAX maqolasiga](https://aamax.co/blog/how-to-deploy-strapi-on-vercel) asoslangan to'liq yechim.

## QADAM 1: @vercel/node O'rnatish

```bash
npm install @vercel/node
```

## QADAM 2: server.js Faylini Yaratish

Maqolada ko'rsatilganidek, `server.js` fayli yaratildi va serverless function formatiga moslashtirildi.

**Fayl joylashuvi:** `server.js` (project root'da)

## QADAM 3: vercel.json Sozlash

Maqoladagi konfiguratsiyaga asosan `vercel.json` sozlandi:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    {
      "src": "/.well-known/(.*)",
      "dest": "/public/.well-known/$1"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

## QADAM 4: config/server.js Sozlash

Maqolada ko'rsatilganidek, `PUBLIC_URL` environment variable qo'shildi:

```javascript
url: env('PUBLIC_URL', env('SERVER_URL', 'http://localhost:1337'))
```

## QADAM 5: Vercel Dashboard'da Sozlash

### 5.1. Build Settings

**Vercel Dashboard > Project Settings > General > Build & Development Settings:**

```bash
Framework Preset: Other
Build Command: npm run build
Output Directory: ./
Install Command: npm install
```

**Muhim:** Maqolada ko'rsatilganidek, Output Directory `./` bo'lishi kerak.

### 5.2. Environment Variables

**Vercel Dashboard > Project Settings > Environment Variables:**

```bash
# Database (Maqolada ko'rsatilganidek)
DB_HOST=your-host
DB_PORT=5432
DB_NAME=your-db
DB_USER=your-user
DB_PASSWORD=your-password

# Strapi Core
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
JWT_SECRET=your-jwt-secret

# Server
NODE_ENV=production
PUBLIC_URL=https://your-project.vercel.app
HOST=0.0.0.0
PORT=1337
```

**Muhim:** Maqolada ko'rsatilganidek, `PUBLIC_URL` qo'shildi.

## QADAM 6: Database Configuration

Maqolada ko'rsatilganidek, `config/database.js` da environment variables ishlatiladi:

```javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DB_HOST'),
      port: env.int('DB_PORT'),
      database: env('DB_NAME'),
      user: env('DB_USER'),
      password: env('DB_PASSWORD'),
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
});
```

## QADAM 7: Deploy Qilish

1. **Vercel Dashboard'da:**
   - **Deploy** ni bosing
   - Yoki GitHub'ga push qiling

2. **Build Logs tekshiring:**
   - `npm install` muvaffaqiyatli
   - `npm run build` muvaffaqiyatli

## QADAM 8: Test Qilish

### 8.1. Admin Panel

```
https://your-project.vercel.app/admin
```

### 8.2. Public API

```
https://your-project.vercel.app/api/articles
```

## QADAM 9: Custom Domain

Maqolada ko'rsatilganidek:

1. **Vercel Dashboard > Domains**
2. Custom domain qo'shing
3. DNS sozlamalarini qo'shing
4. Vercel avtomatik SSL beradi

## QADAM 10: Media Storage (Ixtiyoriy)

Maqolada ko'rsatilganidek, Vercel'da persistent file system yo'q, shuning uchun cloud storage ishlatish tavsiya etiladi:

- AWS S3
- DigitalOcean Spaces
- Cloudinary
- UploadCare

## Xatolar va Yechimlar

### Xato: "Build Failed: Out of Memory"

Maqolada ko'rsatilganidek:

**Yechim:** Environment variable qo'shing:
```bash
NODE_OPTIONS=--max_old_space_size=4096
```

### Xato: "Database Connection Errors"

Maqolada ko'rsatilganidek:

**Yechim:**
1. SSL enabled bo'lishi kerak
2. Credentials to'g'ri bo'lishi kerak
3. Networking rules external access'ga ruxsat berishi kerak

### Xato: "Admin Panel Shows Wrong URLs"

Maqolada ko'rsatilganidek:

**Yechim:** `config/server.js` da `PUBLIC_URL` to'g'ri sozlanganligini tekshiring.

## Foydali Linklar

- [AAMAX Maqolasi - How to Deploy Strapi on Vercel](https://aamax.co/blog/how-to-deploy-strapi-on-vercel)
- [Vercel Documentation](https://vercel.com/docs)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)

## Xulosa

Maqoladagi yondashuvga asosan:

1. ✅ `@vercel/node` o'rnatildi
2. ✅ `server.js` yaratildi (serverless function formatida)
3. ✅ `vercel.json` maqoladagi kabi sozlandi
4. ✅ `config/server.js` da `PUBLIC_URL` qo'shildi
5. ✅ Database configuration maqoladagi kabi sozlandi

**Muvaffaqiyatli deploy!** 🚀

