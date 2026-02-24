import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

const generateToken = async () => {
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      localStorage.setItem("fcm_token", token);

      return token;
    } catch (error) {
      console.error("An error occurred while retrieving token. ", error);
      return null;
    }
  } else {
    console.warn("Permission denied");
    return null;
  }
};

const setupForegroundMessaging = () => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("Foreground message received. ", payload);

    if (payload.notification) {
      const { title, body } = payload.notification;
      new Notification(title || "New Message", {
        body: body || "You have a new notification.",
        icon: "/icon-192x192.png",
      });
    }
  });
};

const scheduleDailyNotification = async (hour: number, minute: number = 0) => {
  if (typeof window === "undefined") return { hour, minute };

  localStorage.setItem("notification_hour", hour.toString());
  localStorage.setItem("notification_minute", minute.toString());

  const now = new Date();
  const scheduleTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0
  );

  if (now > scheduleTime) {
    scheduleTime.setDate(scheduleTime.getDate() + 1);
  }

  const user = localStorage.getItem("airwatch_session");
  const userChallenge = JSON.parse(user || "{}").dailyChallenge?.challenge;
  const userRecommendations = JSON.parse(user || "{}").recommendations?.items;

  const delay = scheduleTime.getTime() - now.getTime();
  console.log("Scheduling notification in", delay / 1000, "seconds");

  setTimeout(() => {
    displayLocalNotification("Daily Challenge", userChallenge || "");

    userRecommendations
      ?.slice(0, 3)
      .forEach((recommendation: string, index: number) => {
        setTimeout(
          () => {
            displayLocalNotification(
              `Daily Reminder ${index + 1}`,
              recommendation || ""
            );
          },
          (index + 1) * 5000
        );
      });
  }, delay);

  return { hour, minute };
};

const displayLocalNotification = (title: string, body: string) => {
  if (typeof window === "undefined") return;

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192x192.png",
    });
  }
};

const initializeMessaging = () => {
  if (typeof window === "undefined") return;

  generateToken();
  setupForegroundMessaging();

  const hour = parseInt(localStorage.getItem("notification_hour") || "8", 10);
  const minute = parseInt(
    localStorage.getItem("notification_minute") || "0",
    10
  );
  scheduleDailyNotification(hour, minute);
};

export {
  displayLocalNotification,
  generateToken,
  initializeMessaging,
  scheduleDailyNotification,
  setupForegroundMessaging,
};
