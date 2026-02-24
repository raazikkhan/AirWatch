"use client";

import { AQIDetailChart } from "@/components/aqi-detail-chart";
import { PollutantChart } from "@/components/pollutant-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/hooks/useSession";
import { AQI } from "@/interfaces/aqi";
import { fetchAQIData } from "@/lib/dashboard";
import { getAQILabel } from "@/lib/map-data";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Details() {
  const { session } = useSession();

  const [activeTab, setActiveTab] = useState("hourly");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [aqiData, setAqiData] = useState<AQI | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchData = () => {
      fetchAQIData(
        (loc) => setLocation(loc),
        (data) => setAqiData(data),
        (isLoading) => setLoading(isLoading)
      );
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-lg font-medium text-gray-600">
          Please log in to view air quality data.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-md p-4">
        <header className="mb-6 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detailed Air Quality</h1>
        </header>

        <Card className="mb-6 border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>{location?.name || "Loading..."}</CardTitle>
              <div className="text-sm text-gray-500">
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    Updated{" "}
                    {aqiData
                      ? new Date(aqiData.lastUpdated).toLocaleTimeString()
                      : "..."}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div
                  className={`text-6xl font-bold ${loading ? "opacity-50" : ""}`}
                >
                  {aqiData ? aqiData.aqi : "..."}
                </div>
                <div
                  className={`text-sm font-medium ${loading ? "opacity-50" : ""}`}
                >
                  {aqiData ? getAQILabel(aqiData.aqi) : "Loading..."}
                </div>
              </div>
              <div
                className={`rounded-md bg-gray-50 p-3 ${loading ? "opacity-50" : ""}`}
              >
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

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Health Risk</div>
                <div className="font-medium">
                  {aqiData
                    ? aqiData.aqi > 150
                      ? "High"
                      : aqiData.aqi > 100
                        ? "Moderate"
                        : "Low"
                    : "..."}
                </div>
              </div>
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
          </CardContent>
        </Card>

        <Card className="mb-6 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle>AQI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="hourly"
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="hourly">Hourly</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
              <TabsContent value="hourly" className="mt-0">
                <AQIDetailChart
                  period="hourly"
                  loading={loading}
                  aqiData={aqiData}
                />
              </TabsContent>
              <TabsContent value="daily" className="mt-0">
                <AQIDetailChart
                  period="daily"
                  loading={loading}
                  aqiData={aqiData}
                />
              </TabsContent>
              <TabsContent value="weekly" className="mt-0">
                <AQIDetailChart
                  period="weekly"
                  loading={loading}
                  aqiData={aqiData}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mb-6 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle>Pollutant Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`mb-4 grid grid-cols-2 gap-3 ${loading ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between rounded-md border border-gray-100 p-2">
                <span>PM2.5</span>
                <span className="font-medium">
                  {aqiData ? `${aqiData.pm25} µg/m³` : "..."}
                </span>
              </div>
              <div className="flex justify-between rounded-md border border-gray-100 p-2">
                <span>PM10</span>
                <span className="font-medium">
                  {aqiData ? `${aqiData.pm10} µg/m³` : "..."}
                </span>
              </div>
              <div className="flex justify-between rounded-md border border-gray-100 p-2">
                <span>NO2</span>
                <span className="font-medium">
                  {aqiData ? `${aqiData.no2} ppb` : "..."}
                </span>
              </div>
              <div className="flex justify-between rounded-md border border-gray-100 p-2">
                <span>O3</span>
                <span className="font-medium">
                  {aqiData ? `${aqiData.o3} ppb` : "..."}
                </span>
              </div>
              <div className="flex justify-between rounded-md border border-gray-100 p-2">
                <span>SO2</span>
                <span className="font-medium">
                  {aqiData ? `${aqiData.so2} ppb` : "..."}
                </span>
              </div>
              <div className="flex justify-between rounded-md border border-gray-100 p-2">
                <span>CO</span>
                <span className="font-medium">
                  {aqiData ? `${aqiData.co} ppm` : "..."}
                </span>
              </div>
            </div>

            <PollutantChart aqiData={aqiData} loading={loading} />

            <div className="mt-4 rounded-md bg-gray-50 p-3">
              <div className="mb-1 flex items-center">
                <Info className="mr-2 h-4 w-4" />
                <span className="font-medium">What does this mean?</span>
              </div>
              <p className="text-sm text-gray-600">
                PM2.5 is the primary pollutant, with levels{" "}
                {aqiData ? `${(aqiData.pm25 / 25).toFixed(1)}x` : "..."} higher
                than WHO guidelines. These fine particles can penetrate deep
                into the lungs and bloodstream, causing respiratory and
                cardiovascular issues.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle>Health Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-gray-50 p-3">
              <div className="font-medium">General Population</div>
              <p className="text-sm text-gray-600">
                {aqiData && aqiData.aqi > 150
                  ? "Everyone may experience more serious health effects. Avoid outdoor activities."
                  : aqiData && aqiData.aqi > 100
                    ? "Increased likelihood of respiratory symptoms in sensitive individuals. Everyone may begin to experience health effects."
                    : "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <div className="font-medium">Sensitive Groups</div>
              <p className="text-sm text-gray-600">
                People with respiratory or heart disease, the elderly and
                children should{" "}
                {aqiData && aqiData.aqi > 150 ? "avoid" : "limit"} prolonged
                outdoor exertion.
              </p>
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <div className="font-medium">Long-term Exposure</div>
              <p className="text-sm text-gray-600">
                Prolonged exposure may lead to increased rates of chronic
                bronchitis, reduced lung function and increased mortality from
                lung cancer and heart disease.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
