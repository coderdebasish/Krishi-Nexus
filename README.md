# 🌾 Krishi-Nexus — Frontend Application

> **Multimodal Farm Intelligence & Disease AI Diagnostics Platform**  
> *Built for IEM Hacks 4.0 | High-Impact Production AgriTech Platform*

---

## 🚀 Live Production Links

* 🌐 **Live Web Application**: [https://krishi-nexus-nu.vercel.app](https://krishi-nexus-nu.vercel.app)
* ⚡ **Live Backend API (Render)**: [https://krishi-nexus-backend.onrender.com/docs](https://krishi-nexus-backend.onrender.com/docs)
* 🐙 **Frontend Repository**: [https://github.com/coderdebasish/Krishi-Nexus](https://github.com/coderdebasish/Krishi-Nexus)
* ⚙️ **Backend Repository**: [https://github.com/coderdebasish/Krishi-Nexus-Backend](https://github.com/coderdebasish/Krishi-Nexus-Backend)

---

## ✨ Features & Workflows

### 1. 🌿 Farm Intelligence Dashboard (`/`)
- Real-time soil metrics (pH, Nitrogen, Phosphorus, Potassium).
- Dynamic Farm Health Score Ring (0–100) with grade classification (A/B/C/D).
- Live OpenWeather integration (temperature, humidity, wind, rainfall probability).
- Personal Field Quick Edit Modal for instant farmer profile customization.

### 2. 🔬 AI Crop Doctor (`/crop-doctor`)
- Upload leaf images for instant disease classification using fine-tuned **MobileNetV2** deep learning architecture.
- Calibrated confidence scoring with Test-Time Augmentation (TTA).
- Detailed treatment recommendations (organic, chemical, and preventative).

### 3. 💬 Multilingual Farmer Copilot (`/copilot`)
- Voice-enabled & text chat assistant powered by **Google Gemini AI**.
- Context-aware, parameter-specific agricultural advice (pH, soil types, pest controls).
- Supports English, Hindi, and Bengali (Banglish).

### 4. 📈 Mandi Market Intelligence (`/markets`)
- Real-time mandi commodity prices (Government Data.gov.in integration).
- Net realization calculator including transport cost & market fee deductions.

### 5. 📑 Comprehensive Advisory Engine (`/advisory`)
- Precision irrigation scheduler based on weather forecast & ET losses.
- N-P-K fertilizer deficit calculator with organic alternative suggestions.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Design System with dark mode glassmorphism & CSS variables
- **Icons**: `lucide-react`
- **Hosting**: Vercel

---

## ⚡ Local Development Setup

```bash
# 1. Clone the frontend repository
git clone https://github.com/coderdebasish/Krishi-Nexus.git
cd Krishi-Nexus

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional, defaults to live backend)
cp .env.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL=https://krishi-nexus-backend.onrender.com

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ License & Disclosures

Developed for **IEM Hacks 4.0**. Designed to empower smallholder farmers across India with accessible, high-precision AI technology.
