# Shree Ram Academy — Deployment Documentation

---

## Overview

| Component  | Platform       | URL                                      |
|------------|----------------|------------------------------------------|
| Frontend   | Vercel          | https://sr-academy-smoky.vercel.app      |
| Backend    | Render          | https://sracademy.onrender.com           |
| Database   | MongoDB Atlas   | cluster0.ud6tpj3.mongodb.net             |

---

## Login Credentials (App)

| Email                        | Password |
|------------------------------|----------|
| harikesh.sahu@gmail.com      | 123456   |
| kusum.gupta@gmail.com        | 123456   |

---

## 1. MongoDB Atlas

### Setup
- Platform: https://cloud.mongodb.com
- Account Email: harikesh1.sahu@ril.com
- Cluster Name: `Cluster0`
- Cluster Host: `cluster0.ud6tpj3.mongodb.net`
- Database Name: `ShreeRamAcademy`

### Database User
| Field    | Value                    |
|----------|--------------------------|
| Username | `sahuharikesh1_db_user`  |
| Password | `7pN0hd5MD5HDvPiM`       |

### Full Connection String
```
mongodb+srv://sahuharikesh1_db_user:7pN0hd5MD5HDvPiM@cluster0.ud6tpj3.mongodb.net/ShreeRamAcademy?retryWrites=true&w=majority&appName=Cluster0
```

### Network Access
- IP Whitelist: `0.0.0.0/0` (Allow access from anywhere — required for Render)

---

## 2. Backend — Render

### Setup
- Platform: https://render.com
- Account Email: harikesh1.sahu@ril.com
- Service Name: `sracademy`
- Service Type: Web Service (Free tier)
- Live URL: **https://sracademy.onrender.com**

### Source
- GitHub Repo: https://github.com/sahuharikesh/SRAcademy.git
- Branch: `main`
- Root Directory: `tuition-app/backend`
- Build Command: `npm install`
- Start Command: `node server.js`

### Environment Variables (set on Render Dashboard)

| Variable           | Value                                                                                                                                          |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `PORT`             | `5000`                                                                                                                                         |
| `NODE_ENV`         | `production`                                                                                                                                   |
| `MONGODB_URI_PROD` | `mongodb+srv://sahuharikesh1_db_user:7pN0hd5MD5HDvPiM@cluster0.ud6tpj3.mongodb.net/ShreeRamAcademy?retryWrites=true&w=majority&appName=Cluster0` |
| `ADMIN_EMAILS`     | `harikesh.sahu@gmail.com:123456,kusum.gupta@gmail.com:123456`                                                                                  |
| `UPI_ID`           | `8422053851@ybl`                                                                                                                               |
| `UPI_NAME`         | `Shree Ram Academy`                                                                                                                            |
| `FRONTEND_URL`     | `https://sr-academy-smoky.vercel.app`                                                                                                          |

> **Note:** `FRONTEND_URL` is used in `server.js` for CORS. It must exactly match the Vercel production URL (no trailing slash).

### Free Tier Behaviour
- The server **spins down after 15 minutes of inactivity**.
- First request after inactivity can take **30–60 seconds** (cold start). This is normal.

---

## 3. Frontend — Vercel

### Setup
- Platform: https://vercel.com
- Account Email: harikesh1.sahu@ril.com
- Project Name: `sr-academy`
- Live URL: **https://sr-academy-smoky.vercel.app**

### Source
- GitHub Repo: https://github.com/sahuharikesh/SRAcademy.git
- Branch: `main`
- Root Directory: `tuition-app/frontend`
- Framework: Vite (React)
- Build Command: `npm run build`
- Output Directory: `dist`

### Environment Variable (baked at build time)

The file `tuition-app/frontend/.env.production` is committed to the repo and is automatically picked up by Vite during build:

```env
VITE_API_URL=https://sracademy.onrender.com/api
```

> **Important:** Vite bakes `import.meta.env.VITE_API_URL` into the JS bundle at build time. Setting it only in the Vercel dashboard is not enough — it must be in `.env.production` committed to the repo so every Vercel build gets the correct API URL.

Used in `src/api.js`:
```js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });
```

---

## 4. GitHub Repository

- Repo URL: https://github.com/sahuharikesh/SRAcademy.git
- Account: sahuharikesh / sahuharikesh1
- Branch: `main`
- Project structure:
  ```
  SR/
  ├── tuition-app/
  │   ├── frontend/          ← React + Vite (deployed to Vercel)
  │   │   └── .env.production
  │   └── backend/           ← Node.js + Express (deployed to Render)
  │       ├── server.js
  │       ├── .env           ← local only, NOT committed
  │       └── .env.example   ← template for reference
  └── DEPLOYMENT.md          ← this file
  ```

---

## 5. How Everything Connects

```
User Browser
    │
    ▼
Vercel (Frontend)
https://sr-academy-smoky.vercel.app
    │  VITE_API_URL = https://sracademy.onrender.com/api
    │  (baked into JS bundle at build time)
    ▼
Render (Backend)
https://sracademy.onrender.com
    │  CORS allows: https://sr-academy-smoky.vercel.app
    │  Auth reads:  ADMIN_EMAILS env var
    ▼
MongoDB Atlas
cluster0.ud6tpj3.mongodb.net / ShreeRamAcademy
    (students, attendance, fees, groups collections)
```

---

## 6. Key Files

| File | Purpose |
|------|---------|
| `tuition-app/frontend/.env.production` | Bakes backend URL into Vite build |
| `tuition-app/frontend/src/api.js` | Axios instance using `VITE_API_URL` |
| `tuition-app/backend/server.js` | Express app, CORS config, MongoDB connect |
| `tuition-app/backend/controllers/authController.js` | Login logic from `ADMIN_EMAILS` env var |
| `tuition-app/backend/.env.example` | Template showing all required env vars |

---

## 7. Re-deployment Steps (if needed)

### Update Frontend
```bash
git add .
git commit -m "your message"
git push origin main
# Vercel auto-deploys on push
```

### Update Backend
- Push to `main` — Render auto-deploys.
- Or go to Render Dashboard → Manual Deploy.

### Add a New Admin User
1. Go to Render Dashboard → `sracademy` service → Environment.
2. Edit `ADMIN_EMAILS` — append `,newuser@email.com:password`.
3. Click **Save Changes** → Render redeploys automatically.

### Change CORS (if Vercel URL changes)
1. Go to Render Dashboard → Environment.
2. Update `FRONTEND_URL` to the new Vercel URL.
3. Save & redeploy.

---

## 8. How Auto-Deploy Works (Simple)

Ek baar GitHub se connect ho jaane ke baad, sirf **ek command** se dono deploy ho jaate hain:

```
Code badlo  →  git push origin main  →  Vercel + Render automatically deploy
```

### Step-by-step:

```
1. Aap  →  git push origin main

2. GitHub  →  Vercel ko signal bheja
            →  Render ko signal bheja

3. Vercel  →  Frontend build kiya (npm run build)
            →  Live ho gaya ✅  (https://sr-academy-smoky.vercel.app)

4. Render  →  Backend restart kiya (node server.js)
            →  Live ho gaya ✅  (https://sracademy.onrender.com)
```

> **Note:** Claude Code khud `git push` nahi kar sakta — uske liye GitHub credentials chahiye.
> Isliye push hamesha aapko manually karna hoga.

---

*Generated: 26 June 2026*
