"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSession } from "@/hooks/useSession";
import { User } from "@/interfaces/user";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { session, updateSession } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<User>({
    name: "",
    age: 0,
    gender: "",
    activityLevel: "",
    healthConditions: [],
    outdoorActivities: [],
    commute: "",
  });

  useEffect(() => {
    if (session?.user) {
      setProfile(session.user);
    }
  }, [session]);

  const handleSave = async () => {
    try {
      await updateSession({
        ...session,
        user: profile,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (session?.user) {
      setProfile(session.user);
    }
    setIsEditing(false);
  };

  const handleHealthConditionChange = (condition: string) => {
    setProfile((prev) => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter((item) => item !== condition)
        : [...prev.healthConditions, condition],
    }));
  };

  const handleOutdoorActivityChange = (activity: string) => {
    setProfile((prev) => ({
      ...prev,
      outdoorActivities: prev.outdoorActivities.includes(activity)
        ? prev.outdoorActivities.filter((item) => item !== activity)
        : [...prev.outdoorActivities, activity],
    }));
  };

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
          <h1 className="text-2xl font-bold">Profile</h1>
        </header>

        <Card className="mb-6 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  required
                />
              ) : (
                <div className="rounded-md border border-gray-200 p-2">
                  {profile.name || "Not set"}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                {isEditing ? (
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        age: parseInt(e.target.value, 10),
                      })
                    }
                    placeholder="Age"
                    required
                  />
                ) : (
                  <div className="rounded-md border border-gray-200 p-2">
                    {profile.age || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {isEditing ? (
                  <Select
                    value={profile.gender}
                    onValueChange={(value) =>
                      setProfile({ ...profile, gender: value })
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
                ) : (
                  <div className="rounded-md border border-gray-200 p-2">
                    {profile.gender || "Not set"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-level">Activity Level</Label>
              {isEditing ? (
                <Select
                  value={profile.activityLevel}
                  onValueChange={(value) =>
                    setProfile({ ...profile, activityLevel: value })
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
              ) : (
                <div className="rounded-md border border-gray-200 p-2">
                  {profile.activityLevel || "Not set"}
                </div>
              )}
            </div>

            {isEditing ? (
              <>
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
                          checked={profile.healthConditions.includes(key)}
                          onCheckedChange={() =>
                            handleHealthConditionChange(key)
                          }
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
                          checked={profile.outdoorActivities.includes(key)}
                          onCheckedChange={() =>
                            handleOutdoorActivityChange(key)
                          }
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
                    value={profile.commute}
                    onValueChange={(value) =>
                      setProfile((prev) =>
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
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Health Conditions</Label>
                  <div className="rounded-md border border-gray-200 p-2">
                    {profile.healthConditions.length > 0
                      ? profile.healthConditions.join(", ")
                      : "Not set"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Outdoor Activities</Label>
                  <div className="rounded-md border border-gray-200 p-2">
                    {profile.outdoorActivities.length > 0
                      ? profile.outdoorActivities.join(", ")
                      : "Not set"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Commute</Label>
                  <div className="rounded-md border border-gray-200 p-2">
                    {profile.commute || "Not set"}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button className="w-full" onClick={handleEdit}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
