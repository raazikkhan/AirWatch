"use client";

import GoogleMapComponent from "@/components/google-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/useSession";
import { Location } from "@/interfaces/map";
import { getAQIColor, getAQIData, getAQILabel } from "@/lib/map-data";
import { useLoadScript } from "@react-google-maps/api";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { session } = useSession();

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchedLocations, setSearchedLocations] = useState<Location[]>([]);
  const [isLoadingAQI, setIsLoadingAQI] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries: ["places"],
  });

  const [isLocationAccessGranted, setIsLocationAccessGranted] =
    useState<boolean>(false);

  useEffect(() => {
    if (session?.settings.locationAccess) {
      setIsLocationAccessGranted(true);
    }
  }, [session?.settings.locationAccess]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !searchBoxRef.current) {
      const searchBox = new google.maps.places.SearchBox(inputRef.current);
      searchBoxRef.current = searchBox;

      searchBox.addListener("places_changed", async () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
          const place = places[0];
          if (place.geometry?.location) {
            const location: Location = {
              name: place.name || "Selected Location",
              position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              timestamp: Date.now(),
              address: place.formatted_address || undefined,
            };
            setSearchedLocations((prev) => [...prev, location]);
            setSearchQuery("");
            setError(null);

            await fetchAQIData(location);
            await fetchNearbyStations(
              location.position.lat,
              location.position.lng
            );
          }
        }
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    const refreshAQI = async () => {
      for (const location of searchedLocations) {
        await fetchAQIData(location);
      }
    };

    const intervalId = setInterval(refreshAQI, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [searchedLocations]);

  if (!isLocationAccessGranted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p>Location access not granted</p>
        <p>Please enable location access in the settings</p>
      </div>
    );
  }

  const fetchAQIData = async (location: Location) => {
    const aqi = await getAQIData(location.position.lat, location.position.lng);
    if (aqi !== null) {
      setSearchedLocations((prev) =>
        prev.map((loc) =>
          loc.name === location.name &&
          loc.position.lat === location.position.lat &&
          loc.position.lng === location.position.lng
            ? { ...loc, aqi }
            : loc
        )
      );
    }
  };

  const fetchNearbyStations = async (lat: number, lng: number) => {
    setIsLoadingAQI(true);
    try {
      const aqi = await getAQIData(lat, lng);
      if (aqi !== null) {
        setSearchedLocations((prev) => {
          const locations = [...prev];
          const lastLocation = locations[locations.length - 1];
          if (lastLocation) {
            lastLocation.aqi = aqi;
          }
          return locations;
        });
      }
    } catch (error) {
      console.error("Error fetching AQI data:", error);
    }
    setIsLoadingAQI(false);
  };

  const handleMapMarkerClick = (location: Location) => {
    setSearchedLocations((prev) =>
      prev.map((loc) =>
        loc.name === location.name &&
        loc.position.lat === location.position.lat &&
        loc.position.lng === location.position.lng
          ? { ...loc, timestamp: Date.now() }
          : loc
      )
    );
  };

  const removeLocation = (location: Location) => {
    setSearchedLocations((prev) =>
      prev.filter(
        (loc) =>
          !(
            loc.name === location.name &&
            loc.position.lat === location.position.lat &&
            loc.position.lng === location.position.lng
          )
      )
    );
  };

  const sortedLocations = [...searchedLocations].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className="container mx-auto max-w-md p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Air Quality Map</h1>
      </header>

      <div className="mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for any location or AQI city..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {isLoadingAQI && (
          <p className="mt-2 text-sm text-blue-500">
            Loading air quality data...
          </p>
        )}
      </div>

      <div className="relative mb-6 h-[500px] overflow-hidden rounded-lg border border-gray-200">
        <GoogleMapComponent
          searchedLocations={searchedLocations}
          onMapClick={handleMapMarkerClick}
        />

        <div className="absolute bottom-4 right-4 rounded-md bg-white p-2 shadow-sm">
          <div className="mb-1 text-xs font-medium">AQI Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-gray-300"></div>
              <span>Good (0-50)</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-gray-500"></div>
              <span>Moderate (51-100)</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-gray-700"></div>
              <span>Unhealthy (101-150)</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-black"></div>
              <span>Very Unhealthy (151+)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedLocations.map((location) => (
          <Card
            key={`${location.name}-${location.position.lat}-${location.position.lng}`}
            className="border-gray-200"
          >
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex-1 min-w-0 mr-4">
                <div className="font-medium truncate">{location.name}</div>
                {location.address && (
                  <div className="text-sm text-gray-500 truncate">
                    {location.address}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {location.position.lat.toFixed(4)},{" "}
                  {location.position.lng.toFixed(4)}
                </div>
              </div>
              <div className="flex items-center shrink-0">
                {location.aqi && (
                  <>
                    <div className="mr-2 text-xl font-bold">{location.aqi}</div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs ${getAQIColor(
                        location.aqi
                      )}`}
                    >
                      {getAQILabel(location.aqi)}
                    </div>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => removeLocation(location)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
