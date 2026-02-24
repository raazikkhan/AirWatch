"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/hooks/useSession";
import { generateToken } from "@/lib/notification";
import { Bell, ChevronRight, Info, LogOut, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { session, updateSession, clearSession } = useSession();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );

  const [settings, setSettings] = useState({
    pushNotifications: false,
    dailyForecast: false,
    aqiAlerts: false,
    aqiThreshold: 100,
    locationAccess: false,
    temperatureUnit: "celsius",
  });

  useEffect(() => {
    if (session?.settings) {
      setSettings(session.settings);
    }
  }, [session]);

  const requestLocationPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });

      if (result.state === "granted") {
        updateSettings("locationAccess", true);
        setLocationError(null);
      } else if (result.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          () => {
            updateSettings("locationAccess", true);
            setLocationError(null);
          },
          (error) => {
            console.error("Location permission denied:", error);
            updateSettings("locationAccess", false);
            setLocationError(
              "Please enable location access to use the map features."
            );
          }
        );
      } else {
        updateSettings("locationAccess", false);
        setLocationError(
          "Location access is blocked. Please enable it in your browser settings."
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setLocationError("Unable to request location permission.");
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      if (Notification.permission === "granted") {
        await generateToken();
        updateSettings("pushNotifications", true);
        setNotificationError(null);
      } else {
        Notification.requestPermission().then(async (permission) => {
          if (permission === "granted") {
            await generateToken();
            updateSettings("pushNotifications", true);
            setNotificationError(null);
          } else {
            updateSettings("pushNotifications", false);
            setNotificationError(
              "Please enable notifications in your browser."
            );
          }
        });
      }
    } else {
      updateSettings("pushNotifications", false);
    }
  };

  const handleLocationToggle = (checked: boolean) => {
    if (checked) {
      requestLocationPermission();
    } else {
      updateSettings("locationAccess", false);
    }
  };

  const updateSettings = async (
    key: keyof typeof settings,
    value: boolean | number | string
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSession({
      ...session,
      settings: newSettings,
    });
  };

  const handleSignOut = async () => {
    await clearSession();
    router.push("/onboarding");
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <Card className="mb-6 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <div className="space-y-1">
                  <Label htmlFor="location-access">
                    Push Notification Access
                  </Label>
                  <p className="text-sm text-gray-500">
                    Required for push notifications
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
            {notificationError && (
              <p className="text-sm text-red-500">{notificationError}</p>
            )}
            {settings.pushNotifications && (
              <p className="text-sm text-green-600">
                Notification access granted!
              </p>
            )}
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <Label htmlFor="daily-forecast">Daily Forecast</Label>
            </div>
            <Switch
              id="daily-forecast"
              checked={settings.dailyForecast}
              onCheckedChange={(checked) =>
                updateSettings("dailyForecast", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <Label htmlFor="aqi-alerts">AQI Alerts</Label>
            </div>
            <Switch
              id="aqi-alerts"
              checked={settings.aqiAlerts}
              onCheckedChange={(checked) =>
                updateSettings("aqiAlerts", checked)
              }
            />
          </div> */}
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle>Location Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <div className="space-y-1">
                  <Label htmlFor="location-access">Location Access</Label>
                  <p className="text-sm text-gray-500">
                    Required for local air quality data
                  </p>
                </div>
              </div>
              <Switch
                id="location-access"
                checked={settings.locationAccess}
                onCheckedChange={handleLocationToggle}
              />
            </div>
            {locationError && (
              <p className="text-sm text-red-500">{locationError}</p>
            )}
            {settings.locationAccess && (
              <p className="text-sm text-green-600">Location access granted!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="flex w-full items-center justify-between border-gray-200"
            onClick={() => router.push("/profile")}
          >
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              <span>Profile</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="flex w-full items-center justify-between border-gray-200"
            onClick={() => router.push("/about")}
          >
            <div className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              <span>About</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="flex w-full items-center justify-between border-gray-200"
            onClick={handleSignOut}
          >
            <div className="flex items-center">
              <LogOut className="mr-2 h-5 w-5" />
              <span>Sign Out</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
