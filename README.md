# AirWatch – Progressive Web App (PWA)

**AirWatch** is a fully responsive, offline-capable Progressive Web App (PWA) built with **Next.js 15**, designed to monitor and visualize air quality data with real-time updates, interactive charts, and a clean UI. Integrated with **Firebase** for notifications and **AI tools** for smart insights, AirWatch provides a seamless and intelligent user experience.

### 🔗 Live Demo


---

## 🚀 Features

- ⚡️ **Progressive Web App**: Installable, offline-first, service worker-enabled.
- 🌐 **Real-Time AQI Dashboard**: Live air quality readings with detailed pollutant breakdowns.
- 📍 **Google Maps Integration**: Visualize AQI data on an interactive map.
- 🔔 **Push Notifications**: Stay updated with important air quality alerts (via Firebase).
- 🧠 **AI Integration**: Smart assistant powered by `groq-sdk` for insights and predictions.
- 🎨 **Beautiful UI**: Built using TailwindCSS, Radix UI, and Lucide Icons.
- 📈 **Rich Visualizations**: Custom charts built with Recharts.
- 🧩 **Modular & Typed**: Strongly typed TypeScript interfaces and scalable architecture.

---

## 🧱 Project Structure

```
.
├── public/                  # Static assets
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable UI & charts
│   ├── hooks/              # Custom React hooks
│   ├── interfaces/         # TypeScript types
│   ├── lib/                # Business logic (Firebase, AI, etc.)
│   └── middleware.ts       # App middleware
├── scripts/                # SW generator script
├── firebase-messaging-sw.template.js
├── next.config.ts          # PWA config
└── ...
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: @react-google-maps/api
- **State/UI**: [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **PWA**: [@ducanh2912/next-pwa](https://ducanh-next-pwa.vercel.app/)
- **Notifications**: [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- **AI**: [Groq SDK](https://www.npmjs.com/package/groq-sdk)
- **Type Checking**: TypeScript
- **Linting/Formatting**: ESLint + Prettier

---

## 📦 Installation

```bash
# 1. Clone the repo
git clone https://github.com/raazikkhan/airwatch.git
cd airwatch

# 2. Install dependencies
yarn install

# 3. Set up environment variables
vim .env.local

# 4. Run the dev server
yarn dev
```

---

## 🧪 Scripts

| Command          | Description                 |
| ---------------- | --------------------------- |
| `yarn dev`       | Run in development mode     |
| `yarn build`     | Production build            |
| `yarn start`     | Start the production server |
| `yarn lint`      | Run ESLint                  |
| `yarn format`    | Format code with Prettier   |
| `yarn typecheck` | Run TypeScript type checks  |

---

## 🔐 Environment Variables

```env
GROQ_API_KEY=...

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

NEXT_PUBLIC_WAQI_API_TOKEN=...
NEXT_PUBLIC_OPENWEATHER_API_KEY=...

SESSION_KEY=...
SESSION_EXPIRATION_TIME=...

NODE_ENV=...

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

---

## 📲 PWA & Firebase Setup

1. Ensure your Firebase project has **Cloud Messaging** enabled.
2. Replace `firebase-messaging-sw.template.js` with your actual messaging logic and rename to `firebase-messaging-sw.js`.
3. Service worker registration is handled automatically for production builds.

---

## 🧠 AI Integration (Groq SDK)

AI is powered by the [Groq SDK](https://www.npmjs.com/package/groq-sdk), used in the backend route under `/api/ai`. You can easily extend this to handle more natural language interactions or predictive analytics.

---

## 📌 Roadmap

- 🔐 Add user authentication
- 🤖 Expand AI assistant with more prompts
- 🌍 Add multi-language (i18n) support
- 🧾 Export AQI reports as downloadable PDF
- 🧪 Add unit tests & end-to-end (E2E) tests

---

## 👨‍💻 Author

**Razik Khan**  


---

## 🧑‍💻 Contributing

Contributions are welcome! Please open an issue or submit a PR for any improvements or bug fixes.

---

## 📄 License

MIT License © 2026
