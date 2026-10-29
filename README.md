# Nourish — Body Recomposition Macro Tracker

A mobile-first web app tailored for your **75 kg body recomposition plan** (building muscle while shedding abdominal fat).

🌐 **Live URL:** [https://am610.github.io/nourish-tracker/](https://am610.github.io/nourish-tracker/)  
📦 **Repository:** [https://github.com/am610/nourish-tracker](https://github.com/am610/nourish-tracker)

---

## 🎯 Your Daily Nutrition Targets

- **Daily Energy Target:** `2,000 kcal`
- **Protein Anchor:** `150 g` (30% · 600 kcal) — 140–160 g recomposition window
- **Carbohydrates:** `204 g` (41% · 816 kcal) — fuels workouts & recovery
- **Fats:** `65 g` (29% · 585 kcal) — hormonal health & satiety

---

## ✨ Key Features Built In

1. **Option A & Option B Strategy Comparison:**
   - **Option A (Convenience / Current):** 500 ml Fairlife Milk + 2 scoops Nutricost Whey isolate in the morning (`87 g Protein`, `~570 kcal`) then straight to lunch.
   - **Option B (Optimal Muscle Protein Synthesis):** Morning split shake (`44 g Protein`), balanced lunch (`38 g`), afternoon eggs & fruit (`15–18 g`), dinner (`18 g`), and evening split shake (`44 g`).
   - Includes **1-Tap Templates** to automatically log either routine into today's diary.
2. **Built-in Indian & Fitness Staples (1-Tap Logging):**
   - Fairlife Whole Milk vs. Fat-Free Skim Milk (250 ml / 500 ml)
   - Nutricost Whey Isolate (1 scoop / 2 scoops)
   - Whole Boiled Eggs (2 or 3 eggs)
   - Cooked Basmati Rice (1 cup / 150 g)
   - Cooked Yellow / Toor Dal (1 bowl / 200 g)
   - Chapati / Roti (1 or 2 pieces)
   - Chicken Breast & Fish Fillets (100 g cooked)
   - Mixed Vegetables & Fruits
3. **Camera & Photo Scanner:**
   - **Nutrition Facts OCR Scanner:** Uses client-side OCR (`Tesseract.js`) to read nutrition tables directly in the browser—no API key or backend needed!
   - **Gemini AI Vision Integration:** Optional connection to Google Gemini 1.5/2.0 Flash to visually identify meal plates, estimate portion weights, and calculate macros with AI.
4. **Body Recomposition Progress Tracking:**
   - Log weekly waist circumference (inches/cm) and morning body weight.
   - Interactive trend charts: in body recomposition, a **shrinking waistline at ~75 kg** confirms you are gaining muscle and losing belly fat.
5. **Mobile PWA & Offline Support:**
   - Works fully offline using browser `localStorage` and Service Worker caching.
   - Supports 1-click JSON backup export and restore.

---

## 🚀 How to Run & Host for Free

### Option 1: Open Locally on Your Mac Right Now
Simply double-click [`index.html`](./index.html) in Finder, or run in your terminal:
```bash
cd /Users/ayan/.gemini/antigravity/scratch/nourish-tracker
open index.html
```

To test on your mobile phone over your local Wi-Fi:
```bash
python3 -m http.server 8080
```
Then on your phone's browser, open `http://<your-mac-ip>:8080`.

---

### Option 2: Free 1-Minute Hosting on GitHub Pages (Recommended)

1. Open [github.com/new](https://github.com/new) and create a repository named **`nourish-tracker`** (choose **Public**).
2. In your terminal, initialize and push this directory:
   ```bash
   cd /Users/ayan/.gemini/antigravity/scratch/nourish-tracker
   git init
   git add .
   git commit -m "Initial commit of Nourish tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/nourish-tracker.git
   git push -u origin main
   ```
3. In your GitHub repo, go to **Settings** → **Pages**.
4. Under **Build and deployment**, set Source to **Deploy from a branch**, select branch **`main`** and folder **`/ (root)`**, then click **Save**.
5. Within 1 minute, your live mobile URL will be:
   ```
   https://YOUR-USERNAME.github.io/nourish-tracker/
   ```

---

### Option 3: Free 15-Second Drag & Drop on Netlify

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the entire `/Users/ayan/.gemini/antigravity/scratch/nourish-tracker` folder into the upload box.
3. Netlify will instantly provide a public HTTPS URL (e.g. `https://random-name.netlify.app`) that you can open from any mobile phone.

---

## 📱 How to Install on Your Phone's Home Screen (PWA)

- **iPhone (Safari):** Open your hosted URL in Safari, tap the **Share** button (box with upward arrow), and select **"Add to Home Screen"**. It will launch full-screen like a native app.
- **Android (Chrome):** Open your hosted URL in Chrome, tap the 3-dots menu, and tap **"Install App"** or **"Add to Home screen"**.

---

## 📸 Enabling AI Photo Recognition (Optional)

1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In the Nourish app, go to **Settings & Backup** (or the gear icon).
3. Paste your key into the **Gemini API Key** field and tap **Save Key**.
4. Now, whenever you take a picture of a plate of food, Gemini will identify the food, estimate the portion, and calculate the calories and macros automatically!
