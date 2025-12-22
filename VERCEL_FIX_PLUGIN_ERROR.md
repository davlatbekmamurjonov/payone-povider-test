# Vercel'da Strapi Plugin Error Fix

## Muammo

```
Cannot find module '@strapi/plugin-content-manager/package.json'
```

## Sabab

[Vercel Community maqolasiga](https://community.vercel.com/t/deployment-not-working-with-strapi/2719) asosan, Vercel'da serverless function'da `node_modules` to'liq include qilinmayapti yoki plugin'lar to'g'ri resolve qilinmayapti.

## Yechim

### 1. .npmrc Faylini Yaratish

Maqolada ko'rsatilganidek, `.npmrc` faylida `hoist=true` qo'shish kerak:

```ini
hoist=true
strict-peer-dependencies=false
```

Bu barcha dependency'larni hoist qiladi va plugin'lar topilishini ta'minlaydi.

### 2. package.json Tekshirish

Barcha plugin'lar `dependencies` da bo'lishi kerak (devDependencies emas):

```json
{
  "dependencies": {
    "@strapi/strapi": "4.25.19",
    "@strapi/plugin-content-manager": "4.25.19",
    "@strapi/plugin-content-type-builder": "4.25.19",
    "@strapi/plugin-email": "4.25.19",
    "@strapi/plugin-upload": "4.25.19",
    "@strapi/plugin-users-permissions": "4.25.19",
    "@strapi/plugin-i18n": "4.25.19",
    "@vercel/node": "^3.0.0"
  }
}
```

### 3. vercel.json Sozlash

Maqolada ko'rsatilganidek, `builds` ishlatiladi:

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### 4. server.js Faylini Yaratish

Maqolada ko'rsatilganidek, `server.js` fayli yaratiladi:

```javascript
const { default: Strapi } = require("@strapi/strapi");

let strapiInstance;

const startStrapi = async () => {
  if (!strapiInstance) {
    strapiInstance = await Strapi({
      distDir: "./dist",
      autoReload: false,
      serveAdminPanel: true,
    }).load();
  }
  return strapiInstance;
};

module.exports = async (req, res) => {
  try {
    const app = await startStrapi();

    if (!app || !app.server || !app.server.app) {
      throw new Error("Strapi app or server not initialized");
    }

    const handler = app.server.app.callback();
    return handler(req, res);
  } catch (error) {
    console.error("Strapi server error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
};
```

### 5. Vercel Dashboard'da Build Settings

**Vercel Dashboard > Project Settings > General > Build & Development Settings:**

```bash
Framework Preset: Other
Build Command: npm run build
Output Directory: ./
Install Command: npm install
```

**Muhim:** Maqolada ko'rsatilganidek, Output Directory `./` bo'lishi kerak.

### 6. Environment Variables

**Vercel Dashboard > Project Settings > Environment Variables:**

```bash
# Database
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
```

## Qadama-qadam Fix

1. ✅ `.npmrc` faylini yarating (`hoist=true`)
2. ✅ `package.json` da barcha plugin'lar `dependencies` da
3. ✅ `@vercel/node` o'rnatilgan
4. ✅ `server.js` fayli yaratilgan
5. ✅ `vercel.json` maqoladagi kabi sozlangan
6. ✅ Vercel Dashboard'da Build Settings to'g'ri
7. ✅ Environment Variables qo'shilgan

## Test Qilish

1. **Commit va Push:**

   ```bash
   git add .npmrc server.js vercel.json package.json
   git commit -m "Fix: Add hoist=true and fix plugin resolution"
   git push
   ```

2. **Vercel'da Redeploy:**

   - Vercel Dashboard > Deployments > Latest > Redeploy

3. **Build Logs Tekshiring:**

   - `npm install` muvaffaqiyatli
   - Plugin'lar o'rnatilganligi
   - `npm run build` muvaffaqiyatli

4. **Function Logs Tekshiring:**
   - "Strapi loaded successfully" ko'rinishi
   - Xatolar yo'qligi

## Foydali Linklar

- [Vercel Community - Deployment not working with Strapi](https://community.vercel.com/t/deployment-not-working-with-strapi/2719)
- [AAMAX - How to Deploy Strapi on Vercel](https://aamax.co/blog/how-to-deploy-strapi-on-vercel)
- [Strapi FAQ](https://docs.strapi.io/dev-docs/faq)
