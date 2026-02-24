"use client";

import { useEffect } from "react";
import { initializeMessaging } from "./notification";

export default function ServiceWorker() {
  useEffect(() => {
    const registerFirebaseSW = async () => {
      if (!("serviceWorker" in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        console.log("🔥 Firebase SW registered:", registration.scope);

        initializeMessaging();
      } catch (err) {
        console.error("❌ Firebase SW registration failed:", err);
      }
    };

    registerFirebaseSW();
  }, []);

  return null;
}
