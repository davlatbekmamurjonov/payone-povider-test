# Vercel'ga Strapi 4 Deploy Qilish - To'liq Qo'llanma

## QADAM 1: GitHub'ga Push Qilish

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## QADAM 2: Vercel Dashboard'da Project Yaratish

1. [vercel.com](https://vercel.com) ga kiring
2. **New Project** ni bosing
3. GitHub repository'ni tanlang
4. **Import** ni bosing

## QADAM 3: Vercel Build Settings

**Vercel Dashboard > Project Settings > General > Build & Development Settings:**

```bash
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x (yoki 20.x)
```

## QADAM 4: Environment Variables

**Vercel Dashboard > Project Settings > Environment Variables:**

### 4.1. Strapi Core (MUST HAVE)

```bash
APP_KEYS=key1,key2,key3,key4
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
API_TOKEN_SALT=your-api-token-salt-here
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here
```

**Qanday yaratish:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4.2. Database (PostgreSQL tavsiya etiladi)

**Vercel Postgres yoki Supabase:**
```bash
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DATABASE_SSL=true
```

**Yoki boshqa database:**
```bash
DATABASE_CLIENT=mysql
DATABASE_HOST=your-host
DATABASE_PORT=3306
DATABASE_NAME=your-db
DATABASE_USERNAME=your-user
DATABASE_PASSWORD=your-pass
DATABASE_SSL=false
```

### 4.3. Server

```bash
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
SERVER_URL=https://your-project.vercel.app
```

**Muhim:** `SERVER_URL` ni Vercel domain'ingizga o'zgartiring!

### 4.4. Payone Plugin (Ixtiyoriy)

```bash
PAYONE_AID=your-aid
PAYONE_MID=your-mid
PAYONE_PORTAL_ID=your-portal-id
PAYONE_PORTAL_KEY=your-key
PAYONE_MODE=test
```

## QADAM 5: Database Configuration

`config/database.js` faylini tekshiring:

```javascript
module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'postgres');

  const connections = {
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: false,
        },
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
```

## QADAM 6: Deploy Qilish

1. **Vercel Dashboard'da:**
   - **Deploy** ni bosing
   - Yoki GitHub'ga push qiling (avtomatik deploy)

2. **Build Logs tekshiring:**
   - `npm install` muvaffaqiyatli
   - `npm run build` muvaffaqiyatli
   - `dist` papkasi yaratilgan

## QADAM 7: Test Qilish

### 7.1. Admin Panel

```
https://your-project.vercel.app/admin
```

### 7.2. API

```
https://your-project.vercel.app/api
```

### 7.3. Health Check

```
https://your-project.vercel.app/_health
```

### 7.4. Well-known (Apple Pay)

```
https://your-project.vercel.app/.well-known/apple-developer-merchantid-domain-association
```

## QADAM 8: Xatolar va Yechimlar

### Xato: "Cannot find module '@strapi/plugin-content-manager'"

**Sabab:** `node_modules` to'liq o'rnatilmagan

**Yechim:**
1. `.vercelignore` da `node_modules` ignore qilinmaganligini tekshiring
2. Build logs'da `npm install` muvaffaqiyatli bo'lganligini tekshiring
3. Vercel'da **Redeploy** qiling

### Xato: "404 Not Found"

**Sabab:** Routes noto'g'ri sozlangan

**Yechim:**
1. `vercel.json` da routes to'g'ri sozlanganligini tekshiring
2. `api/index.js` fayli mavjudligini tekshiring
3. Function logs'ni tekshiring

### Xato: "Database connection failed"

**Sabab:** Database sozlamalari noto'g'ri

**Yechim:**
1. Environment variables to'g'ri qo'shilganligini tekshiring
2. Database connection string to'g'ri ekanligini tekshiring
3. Database provider'da Vercel IP'lariga ruxsat bering

### Xato: "Build failed"

**Sabab:** Build command yoki dependencies muammosi

**Yechim:**
1. Build logs'ni to'liq ko'rib chiqing
2. `package.json` da build script to'g'ri ekanligini tekshiring
3. Dependencies to'liq o'rnatilganligini tekshiring

## QADAM 9: Production'ga O'tkazish

### 9.1. Custom Domain

1. **Vercel Dashboard > Project Settings > Domains**
2. Custom domain qo'shing
3. DNS sozlamalarini qo'shing

### 9.2. SSL Sertifikati

Vercel avtomatik SSL beradi. Qo'shimcha sozlash kerak emas.

### 9.3. Environment Variables

Production environment uchun alohida variable'lar sozlang.

## QADAM 10: Monitoring

### 10.1. Vercel Analytics

Vercel Dashboard > Analytics

### 10.2. Function Logs

Vercel Dashboard > Deployments > Latest > Function Logs

### 10.3. Build Logs

Vercel Dashboard > Deployments > Latest > Build Logs

## Foydali Linklar

- [Vercel Documentation](https://vercel.com/docs)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Strapi on Vercel](https://docs.strapi.io/dev-docs/deployment/hosting-guides/vercel)

## Xulosa

✅ **To'liq deploy qo'llanmasi:**

1. ✅ GitHub'ga push qiling
2. ✅ Vercel Dashboard'da project yarating
3. ✅ Build Settings sozlang
4. ✅ Environment Variables qo'shing
5. ✅ Database sozlang
6. ✅ Deploy qiling
7. ✅ Test qiling

**Muvaffaqiyatli deploy!** 🚀

