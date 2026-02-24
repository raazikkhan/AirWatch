"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-md p-4">
        <header className="mb-6 flex items-center">
          <Button
            variant="ghost"
            className="mr-4 p-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">About</h1>
        </header>

        <Card className="mb-6 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle>AirWatch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              AirWatch is your personal air quality monitoring companion. Stay
              informed about the air quality in your area and make informed
              decisions about outdoor activities.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Features</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Real-time air quality monitoring</li>
                <li>Personalized AQI alerts</li>
                <li>Daily forecasts</li>
                <li>Location-based updates</li>
                <li>Historical AQI trends</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Version</h3>
              <p className="text-gray-600">1.0.0</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Contact</h3>
              <p className="text-gray-600">
                For support or feedback, please email us at:
                <br />
                <a
                  href="mailto:mdrazikkhan108@gmail.com"
                  className="text-blue-600"
                >
                  mdrazikkhan108@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              AirWatch uses data from multiple reliable sources to provide
              accurate air quality information:
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>World Air Quality Index (WAQI)</li>
              <li>OpenWeather API</li>
              <li>Local environmental monitoring stations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
