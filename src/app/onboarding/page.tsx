"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/hooks/useSession";
import type { User as UserProfile } from "@/interfaces/user";
import { generateToken } from "@/lib/notification";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  Info,
  MapPin,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Onboarding() {
  const router = useRouter();
  const { session, updateSession } = useSession();

  const getNormalizedUser = (
    rawUser: Partial<UserProfile> = {}
  ): UserProfile => ({
    name: rawUser.name ?? "",
    age: rawUser.age ?? 0,
    gender: rawUser.gender ?? "",
    activityLevel: rawUser.activityLevel ?? "",
    healthConditions: rawUser.healthConditions ?? [],
    outdoorActivities: rawUser.outdoorActivities ?? [],
    commute: rawUser.commute ?? "",
  });

  const [step, setStep] = useState(1);
  const [locationPermission, setLocationPermission] = useState(
    session?.settings?.locationAccess || false
  );
  const [notificationPermission, setNotificationPermission] = useState(
    session?.settings?.pushNotifications || false
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );

  const [user, setUser] = useState<UserProfile>(
    getNormalizedUser(session?.user)
  );

  const requestLocationPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      if (result.state === "granted") {
        setLocationPermission(true);
        setLocationError(null);
      } else if (result.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermission(true);
            setLocationError(null);
          },
          (error) => {
            console.error("Location permission denied:", error);
            setLocationPermission(false);
            setLocationError(
              "Please enable location access to use the map features."
            );
          }
        );
      } else {
        setLocationPermission(false);
        setLocationError(
          "Location access is blocked. Please enable it in your browser settings."
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setLocationError("Unable to request location permission.");
    }
  };

  const handleLocationToggle = (checked: boolean) => {
    if (checked) {
      requestLocationPermission();
    } else {
      setLocationPermission(false);
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      if (Notification.permission === "granted") {
        await generateToken();
        setNotificationPermission(true);
        setNotificationError(null);
      } else {
        Notification.requestPermission().then(async (permission) => {
          if (permission === "granted") {
            await generateToken();
            setNotificationPermission(true);
            setNotificationError(null);
          } else {
            setNotificationPermission(false);
            setNotificationError(
              "Please enable notifications in your browser."
            );
          }
        });
      }
    } else {
      setNotificationPermission(false);
    }
  };

  const handleHealthConditionChange = (condition: string) => {
    setUser((prev) => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter((item) => item !== condition)
        : [...prev.healthConditions, condition],
    }));
  };

  const handleOutdoorActivityChange = (activity: string) => {
    setUser((prev) => ({
      ...prev,
      outdoorActivities: prev.outdoorActivities.includes(activity)
        ? prev.outdoorActivities.filter((item) => item !== activity)
        : [...prev.outdoorActivities, activity],
    }));
  };

  useEffect(() => {
    if (session?.user) {
      setUser(getNormalizedUser(session.user));
    }
  }, [session]);

  const nextStep = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      await updateSession({
        ...session,
        user,
        settings: {
          ...session?.settings,
          locationAccess: locationPermission,
          pushNotifications: notificationPermission,
          dailyForecast: session?.settings?.dailyForecast ?? false,
          aqiAlerts: session?.settings?.aqiAlerts ?? false,
          aqiThreshold: session?.settings?.aqiThreshold ?? 0,
          temperatureUnit: session?.settings?.temperatureUnit ?? "C",
        },
      });
      localStorage.setItem("notification_hour", "8");
      localStorage.setItem("notification_minute", "0");
      router.push("/dashboard");
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && "Welcome to AirWatch"}
            {step === 2 && "Understanding Air Quality"}
            {step === 3 && "Personalize Your Experience"}
            {step === 4 && "Tell Us About Yourself"}
            {step === 5 && "Your Activities & Health"}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              "Monitor air quality in real-time and get personalized recommendations"}
            {step === 2 && "Learn how AQI levels affect your health"}
            {step === 3 && "Set your preferences for a better experience"}
            {step === 4 && "Help us personalize your experience"}
            {step === 5 && "For AI-powered personalized recommendations"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6">
                <Info className="h-16 w-16 text-black" />
              </div>
              <p className="text-center text-gray-700">
                AirWatch provides real-time air quality data, personalized
                recommendations, and alerts to help you make informed decisions
                about outdoor activities.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                {Object.entries({
                  "Good (0-50)": "Minimal health risk",
                  "Moderate (51-100)": "Minor respiratory concerns",
                  "Unhealthy (101-150)": "Sensitive groups affected",
                  "Very Unhealthy (151+)": "Health warnings for everyone",
                }).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between border-b border-gray-100 py-2"
                  >
                    <span className="font-medium">{key}</span>
                    <span className="text-sm text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <div className="space-y-1">
                      <Label htmlFor="location">Location Access</Label>
                      <p className="text-sm text-gray-500">
                        Required for local air quality data
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="location"
                    checked={locationPermission}
                    onCheckedChange={handleLocationToggle}
                  />
                </div>
                {locationError && (
                  <p className="text-sm text-red-500">{locationError}</p>
                )}
                {locationPermission && (
                  <p className="text-sm text-green-600">
                    Location access granted!
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <div className="space-y-1">
                      <Label htmlFor="notification">Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Required for local air quality data
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notification"
                    checked={notificationPermission}
                    onCheckedChange={handleNotificationToggle}
                  />
                </div>
                {notificationError && (
                  <p className="text-sm text-red-500">{notificationError}</p>
                )}
                {notificationPermission && (
                  <p className="text-sm text-green-600">
                    Notification access granted!
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <Label htmlFor="name">Your Name</Label>
              </div>
              <Input
                id="name"
                placeholder="Enter your name"
                value={user?.name}
                onChange={(e) =>
                  setUser((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <Label htmlFor="age">Your Age</Label>
                  </div>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={user?.age}
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        age: parseInt(e.target.value, 10),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={user?.gender}
                    onValueChange={(value) =>
                      setUser((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <Label htmlFor="activity-level">Activity Level</Label>
                </div>
                <Select
                  value={user?.activityLevel}
                  onValueChange={(value) =>
                    setUser((prev) => ({ ...prev, activityLevel: value }))
                  }
                >
                  <SelectTrigger id="activity-level">
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries({
                      sedentary: "Sedentary (Little to no exercise)",
                      light: "Light (Light exercise 1-3 days/week)",
                      moderate: "Moderate (Moderate exercise 3-5 days/week)",
                      active: "Active (Hard exercise 6-7 days/week)",
                      "very-active": "Very Active (Professional athlete)",
                    }).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Do you have any of these health conditions?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries({
                    asthma: "Asthma",
                    allergies: "Allergies",
                    copd: "COPD",
                    "heart-disease": "Heart Disease",
                    none: "None",
                  }).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={user?.healthConditions.includes(key)}
                        onCheckedChange={() => handleHealthConditionChange(key)}
                      />
                      <Label htmlFor={key} className="text-sm">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>What outdoor activities do you regularly do?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries({
                    running: "Running",
                    cycling: "Cycling",
                    walking: "Walking",
                    "team-sports": "Team Sports",
                  }).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={user?.outdoorActivities.includes(key)}
                        onCheckedChange={() => handleOutdoorActivityChange(key)}
                      />
                      <Label htmlFor={key} className="text-sm">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>How do you usually commute?</Label>
                <RadioGroup
                  value={user?.commute}
                  onValueChange={(value) =>
                    setUser((prev) =>
                      value ? { ...prev, commute: value } : prev
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="car" id="car" />
                    <Label htmlFor="car">Car</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="public-transport"
                      id="public-transport"
                    />
                    <Label htmlFor="public-transport">Public Transport</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bicycle" id="bicycle" />
                    <Label htmlFor="bicycle">Bicycle</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="walking" id="walking-commute" />
                    <Label htmlFor="walking-commute">Walking</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="border-gray-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={nextStep}
            className="bg-black text-white hover:bg-gray-800"
            disabled={step === 3 && !locationPermission}
          >
            {step < 5 ? "Next" : "Get Started"}{" "}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
