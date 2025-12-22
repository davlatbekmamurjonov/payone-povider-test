# Strapi 4 ni Vercel'ga Deploy Qilish - To'liq Qo'llanma

Internetdan topilgan eng yaxshi amaliyotlarga asoslangan to'liq yechim.

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

## QADAM 5: Deploy Qilish

1. **Vercel Dashboard'da:**

   - **Deploy** ni bosing
   - Yoki GitHub'ga push qiling (avtomatik deploy)

2. **Build Logs tekshiring:**
   - `npm install` muvaffaqiyatli
   - `npm run build` muvaffaqiyatli
   - `dist` papkasi yaratilgan

## QADAM 6: Test Qilish

### 6.1. Admin Panel

```
https://your-project.vercel.app/admin
```

### 6.2. API

```
https://your-project.vercel.app/api
```

### 6.3. Health Check

```
https://your-project.vercel.app/_health
```

## QADAM 7: Xatolar va Yechimlar

### Xato: "Cannot find module '@strapi/plugin-content-manager'"

**Sabab:** Plugin'lar `package.json` da `dependencies` da bo'lishi kerak

**Yechim:**

1. `package.json` da barcha plugin'lar `dependencies` da bo'lishi kerak
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

## Foydali Linklar

- [Vercel Documentation](https://vercel.com/docs)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
