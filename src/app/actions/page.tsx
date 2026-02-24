"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formatRecommendation = (recommendation: string): string => {
  try {
    const matches =
      recommendation.match(/"([^"]*)"/) || recommendation.match(/\. (.+)$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return recommendation;
  } catch (error) {
    console.error("Error formatting recommendation:", error);
    return recommendation;
  }
};

export default function Actions() {
  const { session, updateSession, getDailyChallenge, updateAQIData } =
    useSession();

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<{
    challenge: string;
    completed: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [isLocationAccessGranted, setIsLocationAccessGranted] =
    useState<boolean>(false);

  useEffect(() => {
    if (session?.settings.locationAccess) {
      setIsLocationAccessGranted(true);
    }
  }, [session?.settings.locationAccess]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) {
        setIsUserLoading(false);
        return;
      }

      try {
        await updateAQIData();
        const challenge = await getDailyChallenge();
        if (challenge) {
          setDailyChallenge({
            challenge: challenge.challenge,
            completed: challenge.completed,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setIsUserLoading(false);
      }
    };

    fetchData();
  }, [session?.user, getDailyChallenge, updateAQIData]);

  if (!isLocationAccessGranted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p>Location access not granted</p>
        <p>Please enable location access in the settings</p>
      </div>
    );
  }

  const handleDailyChallengeCompletion = async () => {
    if (!session || !dailyChallenge) return;

    try {
      const now = new Date();
      await updateSession({
        ...session,
        dailyChallenge: {
          challenge: dailyChallenge.challenge,
          completed: true,
          lastUpdated: now.getTime(),
        },
      });

      setDailyChallenge({
        ...dailyChallenge,
        completed: true,
      });
    } catch (error) {
      console.error("Error completing daily challenge:", error);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4">Loading user session...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <div>Please complete onboarding to access this page.</div>;
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <header className="mb-6 flex flex-col items-start justify-between">
        <h1 className="text-2xl font-bold">Climate Actions</h1>
        <div className="text-sm text-gray-600">
          Welcome, {session?.user?.name}
        </div>
      </header>

      <Card className="mb-6 border-gray-200">
        <CardHeader>
          <CardTitle>Current Air Quality</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20" />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  AQI: {session.aqiData?.value ?? "N/A"}
                </span>
                <Badge
                  variant={
                    session.aqiData?.value && session.aqiData.value > 100
                      ? "destructive"
                      : "default"
                  }
                >
                  {session.aqiData?.value && session.aqiData.value > 100
                    ? "Poor"
                    : "Good"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Location: {session.aqiData?.location.name ?? "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {session.aqiData?.lastUpdated
                  ? new Date(session.aqiData.lastUpdated).toLocaleString()
                  : "Never"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateAQIData()}
                className="mt-2"
              >
                Refresh AQI Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200">
        <CardHeader>
          <CardTitle>Daily Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20" />
          ) : dailyChallenge ? (
            <>
              <div className="mb-4 rounded-md bg-gray-50 p-4">
                <div className="mb-2 flex items-center">
                  <span className="font-medium">
                    {dailyChallenge.challenge}
                  </span>
                </div>
                <p className="mb-3 text-sm text-gray-600">
                  Based on your commute preferences and today&apos;s AQI of{" "}
                  {session.aqiData?.value}, taking the metro instead of cycling
                  can reduce your exposure to harmful pollutants by up to 60%.
                  This also reduces your carbon footprint by 3.2 kg CO₂ today.
                </p>
              </div>
              <Button
                variant={dailyChallenge.completed ? "outline" : "default"}
                className="w-full"
                onClick={handleDailyChallengeCompletion}
                disabled={dailyChallenge.completed}
              >
                {dailyChallenge.completed
                  ? "Completed for today"
                  : "Mark as Complete"}
              </Button>
            </>
          ) : (
            <p>No challenge available</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200">
        <CardHeader>
          <CardTitle>AI Personalized Recommendations</CardTitle>
          <CardDescription>
            Based on your health profile and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20" />
          ) : session.recommendations?.items.length ? (
            session.recommendations.items.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-md bg-gray-50 p-3 mb-3"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Recommendation {index + 1}</div>
                  <p className="text-sm text-gray-600">
                    {formatRecommendation(recommendation)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No recommendations available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
