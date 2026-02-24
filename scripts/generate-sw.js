import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.join(
  __dirname,
  "../firebase-messaging-sw.template.js"
);
const OUTPUT_PATH = path.join(__dirname, "../public/firebase-messaging-sw.js");

const config = {
  __FIREBASE_API_KEY__: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  __FIREBASE_AUTH_DOMAIN__: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  __FIREBASE_PROJECT_ID__: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  __FIREBASE_STORAGE_BUCKET__: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  __FIREBASE_MESSAGING_SENDER_ID__:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  __FIREBASE_APP_ID__: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.entries(config).filter(([, val]) => !val);
if (missing.length > 0) {
  console.error("❌ Missing environment variables:");
  missing.forEach(([key]) => console.error(`  - ${key}`));
  process.exit(1);
}

let content = fs.readFileSync(TEMPLATE_PATH, "utf-8");

for (const [key, value] of Object.entries(config)) {
  content = content.replace(new RegExp(key, "g"), value);
}

fs.writeFileSync(OUTPUT_PATH, content);
console.log("✅ firebase-messaging-sw.js generated successfully.");
