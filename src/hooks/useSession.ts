import {
  createSession,
  deleteSession,
  getSession,
  isSessionValid,
  updateAqiData,
  updateDailyChallenge,
  updateNotificationTime,
  updateRecommendations,
} from "@/app/actions";
import { UserSession } from "@/interfaces/session";
import { AIAgent } from "@/lib/ai-agent";
import { getCurrentLocation, getLocationName } from "@/lib/dashboard";
import { getAQIData } from "@/lib/map-data";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const isUpdating = useRef(false);
  const hasCheckedToday = useRef(false);

  const fetchSession = useCallback(() => {
    try {
      const response = getSession();
      if (response instanceof Error) {
        throw response;
      }
      setSession(response);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (updates: Partial<UserSession>) => {
    try {
      const response = await createSession(updates);
      if (response instanceof Error) {
        throw response;
      }
      setSession(response);
      return response;
    } catch {
      throw new Error("Failed to update session");
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      deleteSession();
      setSession(null);
    } catch {
      throw new Error("Failed to clear session");
    }
  }, []);

  const updateAQIData = useCallback(async () => {
    if (!session?.settings?.locationAccess) return null;

    try {
      const position = await getCurrentLocation();
      if (!position) return null;

      const { latitude: lat, longitude: lng } = position.coords;
      const name = await getLocationName(lat, lng);
      const aqi = await getAQIData(lat, lng);
      if (!aqi) return null;

      const updatedSession = await updateAqiData(aqi, { lat, lng, name });

      return updatedSession instanceof Error ? null : updatedSession;
    } catch {
      return null;
    }
  }, [session?.settings?.locationAccess]);

  const isItTimeToUpdate = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour === 0 && hasCheckedToday.current) {
      hasCheckedToday.current = false;
    }

    return hour >= 3 && hour < 4 && !hasCheckedToday.current;
  }, []);

  const shouldUpdate = useCallback((lastUpdated: number | undefined) => {
    if (!lastUpdated) return true;

    const lastDate = new Date(lastUpdated);
    const now = new Date();

    return (
      lastDate.getDate() !== now.getDate() ||
      lastDate.getMonth() !== now.getMonth() ||
      lastDate.getFullYear() !== now.getFullYear()
    );
  }, []);

  const getDailyChallenge = useCallback(async () => {
    if (!session?.user || isUpdating.current) return null;

    if (!isItTimeToUpdate()) {
      return session.dailyChallenge;
    }

    hasCheckedToday.current = true;

    const shouldUpdateChallenge = shouldUpdate(
      session.dailyChallenge?.lastUpdated
    );
    const shouldUpdateRecommendations = shouldUpdate(
      session.recommendations?.lastUpdated
    );

    if (!shouldUpdateChallenge && !shouldUpdateRecommendations) {
      return session.dailyChallenge;
    }

    isUpdating.current = true;

    try {
      const currentAQI = session.aqiData?.value ?? 142;
      const aiAgent = new AIAgent(session.user);
      const now = Date.now();
      const updates: Partial<UserSession> = {};

      if (shouldUpdateChallenge) {
        const challenge = await aiAgent.getDailyChallenge(currentAQI);
        if (challenge) {
          updates.dailyChallenge = {
            lastUpdated: now,
            completed: false,
            challenge,
          };
          await updateDailyChallenge(challenge);
        }
      }

      if (shouldUpdateRecommendations) {
        const recommendations =
          await aiAgent.getPersonalizedRecommendations(currentAQI);
        if (recommendations && Array.isArray(recommendations)) {
          updates.recommendations = {
            lastUpdated: now,
            items: recommendations,
          };
          await updateRecommendations(recommendations);
        }
      }

      if (Object.keys(updates).length > 0) {
        const updatedSession = await updateSession(updates);
        return updatedSession.dailyChallenge;
      }

      return session.dailyChallenge;
    } catch {
      return session.dailyChallenge;
    } finally {
      isUpdating.current = false;
    }
  }, [session, updateSession, shouldUpdate, isItTimeToUpdate]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    const checkScheduledUpdate = () => {
      if (isItTimeToUpdate()) {
        getDailyChallenge();
      }
    };

    const intervalId = setInterval(checkScheduledUpdate, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isItTimeToUpdate, getDailyChallenge]);

  return {
    session,
    loading,
    updateSession,
    clearSession,
    getDailyChallenge,
    updateAQIData,
    isSessionValid,
    updateNotificationTime,
    updateAqiData,
    updateDailyChallenge,
    updateRecommendations,
  };
}
