"use client";

import { AQIChart } from "@/components/aqi-chart";
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
import { AQI } from "@/interfaces/aqi";
import { fetchAQIData } from "@/lib/dashboard";
import { getAQILabel } from "@/lib/map-data";
import { CheckCircle2, RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
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

export default function Dashboard() {
  const { session } = useSession();

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [aqiData, setAqiData] = useState<AQI | null>(null);
  const [isLocationAccessGranted, setIsLocationAccessGranted] =
    useState<boolean>(false);

  useEffect(() => {
    if (session?.settings.locationAccess) {
      setIsLocationAccessGranted(true);
    }
  }, [session?.settings.locationAccess]);

  const refreshData = () => {
    fetchAQIData(
      (loc) => setLocation(loc),
      (data) => setAqiData(data),
      (isLoading) => setLoading(isLoading)
    );
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isLocationAccessGranted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p>Location access not granted</p>
        <p>Please enable location access in the settings</p>
      </div>
    );
  }

  if (!session?.user) {
    return <div>Please complete onboarding to access this page.</div>;
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AirWatch</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshData}
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <Card className="mb-6 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Current Air Quality</span>
            <span className="text-sm text-gray-500">
              {location?.name || "Loading..."}
            </span>
          </CardTitle>
          <CardDescription>
            Updated{" "}
            {aqiData
              ? new Date(aqiData.lastUpdated).toLocaleTimeString()
              : "..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-64" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-6xl font-bold">
                    {aqiData ? aqiData.aqi : "..."}
                  </div>
                  <div className="text-sm font-medium">
                    {aqiData ? getAQILabel(aqiData.aqi) : "Loading..."}
                  </div>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="mb-1 text-sm font-medium">
                    Primary Pollutant
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-bold">PM2.5</span>
                    <span className="text-sm text-gray-600">
                      {aqiData ? `${aqiData.pm25} µg/m³` : "..."}
                    </span>
                  </div>
                </div>
              </div>

              <AQIChart aqiData={aqiData} loading={loading} />

              <div className="my-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Visibility</div>
                  <div className="font-medium">
                    {aqiData ? `${aqiData.visibility} km` : "..."}
                  </div>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Pressure</div>
                  <div className="font-medium">
                    {aqiData ? `${aqiData.pressure} hPa` : "..."}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Link href="/dashboard/share">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200"
                  >
                    <Share2 className="mr-1 h-4 w-4" /> Share
                  </Button>
                </Link>
                <Link href="/dashboard/details">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle>24-Hour Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <AQIChart aqiData={aqiData} loading={loading} mode="24h" />
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle>AI Health Recommendations</CardTitle>
          <CardDescription>
            Personalized for {session.user.name}, {session.user.age}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : session.recommendations?.items?.length ? (
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
