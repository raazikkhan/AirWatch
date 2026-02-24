importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDdJVPVt4NJbT9JolprRAKrL8F2EV4771o",
  authDomain: "airwatch-67996.firebaseapp.com",
  projectId: "airwatch-67996",
  storageBucket: "airwatch-67996.firebasestorage.app",
  messagingSenderId: "763114270345",
  appId: "1:763114270345:web:af76b80a6384de16ea2058",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/icon-192x192.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
