"use client";

import {
  displayLocalNotification,
  scheduleDailyNotification,
} from "@/lib/notification";
import { useEffect, useState } from "react";

export default function NotificationSettings() {
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsPermissionGranted(Notification.permission === "granted");

      const savedHour = localStorage.getItem("notification_hour");
      const savedMinute = localStorage.getItem("notification_minute");

      if (savedHour) setHour(parseInt(savedHour));
      if (savedMinute) setMinute(parseInt(savedMinute));
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== "undefined") {
      const permission = await Notification.requestPermission();
      setIsPermissionGranted(permission === "granted");
    }
  };

  const saveSettings = () => {
    scheduleDailyNotification(hour, minute);
    alert(
      `Daily notifications scheduled for ${hour}:${minute < 10 ? "0" + minute : minute}`
    );
  };

  const testNotification = () => {
    displayLocalNotification(
      "Test Notification",
      "This is a test notification"
    );
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>

      {!isPermissionGranted && (
        <div className="mb-6 p-4 bg-yellow-100 rounded-md">
          <p className="mb-2">Notifications are not enabled for this site.</p>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Enable Notifications
          </button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Daily Notification Time</h2>
        <div className="flex items-center gap-2">
          <select
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value))}
            className="p-2 border rounded-md"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <span>:</span>
          <select
            value={minute}
            onChange={(e) => setMinute(parseInt(e.target.value))}
            className="p-2 border rounded-md"
          >
            {[0, 15, 18, 30, 45].map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={!isPermissionGranted}
          className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300"
        >
          Save Settings
        </button>

        <button
          onClick={testNotification}
          disabled={!isPermissionGranted}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          Test Notification
        </button>
      </div>
    </div>
  );
}
