# Puzzled

**40-70% of medical devices in low and middle-income countries are broken.** Not because they're useless, but because technicians lack training and repair guidance in their language.

**Puzzled turns any phone camera into an AI-powered repair assistant** — making manuals make sense, one step at a time.

## How It Works

1. **Select your language** — Supports languages via AI translation
2. **Choose a repair tutorial** — Browse visual guides for medical equipment
3. **Follow step-by-step instructions** — Your camera verifies each step in real-time using AI
4. **Get unstuck instantly** — One tap connects you to a remote expert via Zoom

**The magic:** Our AI learns from just 2-3 images per step (few-shot learning), making it practical to create guides for any device.

## What Makes It Different

### Dual AI Verification
- **Siamese Neural Network** (ResNet18): inference, embeddings, cosine similarity verification
- **Claude Vision API**: Natural language feedback on *why* a step is incorrect
- **CLAHE normalization**: Works in poor lighting conditions (critical for field use)

### Built For The Real World
- **Few-shot learning**: Create new guides with just 2-3 photos per step
- **Multilingual**: Instant translation to 100+ languages via MyMemory API + i18next
- **Expert escalation**: One-tap Zoom integration with Server-to-Server OAuth
- **Mobile-first**: Native camera integration, works on any smartphone

**Stack:** React 19 • TypeScript • Tailwind • FastAPI • PyTorch (ResNet18) • Claude Vision • Supabase • Zoom API

## Quick Start

**Frontend:**
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux (venv\Scripts\activate on Windows)
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Zoom API credentials from https://marketplace.zoom.us/develop/create

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

**Test it:** Visit http://localhost:5173, select a tutorial, and try the camera verification!

📚 **Detailed setup, troubleshooting, and development guides:** [backend/README.md](backend/README.md)

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/verify/verify-step` | POST | Verify camera image against reference step |
| `/api/help` | POST | Create instant Zoom meeting with expert |
| `/verify/dashboard` | GET | Real-time verification monitoring dashboard |
| `/docs` | GET | Interactive API documentation |

**Interactive docs:** http://localhost:8000/docs

## Deployment

### Backend (Render)
**Build Command:** `cd backend && pip install -r requirements.txt`
**Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Required Environment Variables:**
- `ZOOM_ACCOUNT_ID`
- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`
- `CORS_ORIGINS`
- `ANTHROPIC_API_KEY`

For detailed deployment instructions, see [backend/README.md](backend/README.md)

### Frontend (Vercel/Render Static Site)
**Build Command:** `npm run build`
**Publish Directory:** `dist`

**Environment Variables:**
- `VITE_API_BASE_URL=https://your-backend.onrender.com`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Built At TreeHacks 2026

**Problem:** Medical devices sit broken in clinics across low and middle-income countries while technicians lack training resources in their language.

**Solution:** AI-powered visual repair guides that work on any phone, in any language, with instant expert backup.

**Impact:** Instead of donating more devices, we help countries fix the ones they already have.

---

**Tech Stack:** React 19 • TypeScript • Tailwind CSS • Vite • FastAPI • PyTorch • ResNet18 • Claude Sonnet 4 • Supabase • Zoom API • i18next • MyMemory Translation API
