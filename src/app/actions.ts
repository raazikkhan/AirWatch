"use client";

import { UserSession } from "@/interfaces/session";
import { User } from "@/interfaces/user";

const SESSION_EXPIRATION_TIME =
  process.env.NEXT_PUBLIC_SESSION_EXPIRATION_TIME || "157680000000";
const SESSION_KEY = process.env.NEXT_PUBLIC_SESSION_KEY || "airwatch_session";

function getSession(): UserSession | Error {
  try {
    if (typeof window === "undefined") {
      return new Error("localStorage is not available in server context");
    }

    const sessionData = localStorage.getItem(SESSION_KEY);

    if (!sessionData) {
      return new Error("No session found");
    }

    const session = JSON.parse(sessionData) as UserSession;

    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return new Error("Session expired");
    }

    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return new Error("Failed to get session");
  }
}

async function createSession(
  sessionData: Partial<UserSession>
): Promise<UserSession | Error> {
  try {
    if (typeof window === "undefined") {
      return new Error("localStorage is not available in server context");
    }

    const currentSessionData = localStorage.getItem(SESSION_KEY);
    const expirationDate = new Date(Date.now() + +SESSION_EXPIRATION_TIME);

    const updatedSession = {
      ...(currentSessionData
        ? JSON.parse(currentSessionData)
        : {
            expiresAt: expirationDate.getTime(),
            user: {
              name: "",
              age: 0,
              gender: "",
              activityLevel: "",
              healthConditions: [],
              outdoorActivities: [],
              commute: "",
            } as User,
            settings: {
              pushNotifications: false,
              dailyForecast: false,
              aqiAlerts: false,
              aqiThreshold: 100,
              locationAccess: false,
              temperatureUnit: "celsius",
            },
            notification: {
              hour: 8,
              minute: 0,
            },
            dailyChallenge: {
              lastUpdated: Date.now(),
              completed: false,
              challenge: "",
            },
            recommendations: {
              lastUpdated: Date.now(),
              items: [],
            },
            aqiData: {
              value: 0,
              lastUpdated: Date.now(),
              location: {
                lat: 0,
                lng: 0,
                name: "",
              },
            },
          }),
      ...sessionData,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));

    return updatedSession as UserSession;
  } catch (error) {
    console.error("Failed to create session:", error);
    return new Error("Failed to create session");
  }
}

function deleteSession(): void | Error {
  try {
    if (typeof window === "undefined") {
      return new Error("localStorage is not available in server context");
    }

    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Failed to delete session:", error);
    return new Error("Failed to delete session");
  }
}

function isSessionValid(): boolean {
  const session = getSession();
  return !(session instanceof Error);
}

async function updateNotificationTime(
  hour: number,
  minute: number
): Promise<UserSession | Error> {
  try {
    const session = getSession();
    if (session instanceof Error) {
      return session;
    }

    return await createSession({
      notification: {
        hour,
        minute,
      },
    });
  } catch (error) {
    console.error("Failed to update notification time:", error);
    return new Error("Failed to update notification time");
  }
}

async function updateAqiData(
  value: number,
  location: { lat: number; lng: number; name: string }
): Promise<UserSession | Error> {
  try {
    const session = getSession();
    if (session instanceof Error) {
      return session;
    }

    return await createSession({
      aqiData: {
        value,
        lastUpdated: Date.now(),
        location,
      },
    });
  } catch (error) {
    console.error("Failed to update AQI data:", error);
    return new Error("Failed to update AQI data");
  }
}

async function updateDailyChallenge(
  challenge: string,
  completed: boolean = false
): Promise<UserSession | Error> {
  try {
    const session = getSession();
    if (session instanceof Error) {
      return session;
    }

    return await createSession({
      dailyChallenge: {
        challenge,
        completed,
        lastUpdated: Date.now(),
      },
    });
  } catch (error) {
    console.error("Failed to update daily challenge:", error);
    return new Error("Failed to update daily challenge");
  }
}

async function updateRecommendations(
  items: string[]
): Promise<UserSession | Error> {
  try {
    const session = getSession();
    if (session instanceof Error) {
      return session;
    }

    return await createSession({
      recommendations: {
        items,
        lastUpdated: Date.now(),
      },
    });
  } catch (error) {
    console.error("Failed to update recommendations:", error);
    return new Error("Failed to update recommendations");
  }
}

export {
  createSession,
  deleteSession,
  getSession,
  isSessionValid,
  updateAqiData,
  updateDailyChallenge,
  updateNotificationTime,
  updateRecommendations,
};
