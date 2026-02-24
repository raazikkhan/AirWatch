import { getAQIColor, getAQILabel } from "@/lib/map-data";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SearchedLocation {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  aqi?: number;
  timestamp: number;
}

interface GoogleMapComponentProps {
  searchedLocations: SearchedLocation[];
  onMapClick?: (location: SearchedLocation) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  mapTypeId: "roadmap",
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

export default function GoogleMapComponent({
  searchedLocations,
  onMapClick,
}: GoogleMapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries: ["places"],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const center = useMemo(() => {
    if (searchedLocations.length > 0) {
      return searchedLocations[searchedLocations.length - 1].position;
    }
    if (currentLocation) {
      return currentLocation;
    }
    return { lat: 20, lng: 0 };
  }, [searchedLocations, currentLocation]);

  const handleMarkerClick = useCallback(
    (location: SearchedLocation) => {
      setActiveMarker(location.name);
      onMapClick?.(location);
      map?.panTo(location.position);
    },
    [map, onMapClick]
  );

  useEffect(() => {
    if (map && searchedLocations.length > 0) {
      const lastLocation = searchedLocations[searchedLocations.length - 1];
      map.panTo(lastLocation.position);
      map.setZoom(12);
    }
  }, [map, searchedLocations]);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">
            Google Maps API Key Missing
          </p>
          <p className="text-sm text-red-500">
            Please add your API key to .env.local file:
            <br />
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">
            Error Loading Google Maps
          </p>
          <p className="text-sm text-red-500">
            {loadError.message}
            <br />
            Please verify your API key and ensure it has access to the Maps
            JavaScript API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={currentLocation && !searchedLocations.length ? 12 : 2}
      center={center}
      options={defaultMapOptions}
      onLoad={setMap}
    >
      {currentLocation && !searchedLocations.length && (
        <Marker
          position={currentLocation}
          title="Your Location"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#3B82F6",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          }}
        />
      )}

      {searchedLocations.map((location) => (
        <Marker
          key={`${location.name}-${location.position.lat}-${location.position.lng}`}
          position={location.position}
          title={location.name}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: location.aqi
              ? getAQIColor(location.aqi, true)
              : "#4B5563",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          }}
          onClick={() => handleMarkerClick(location)}
        >
          {activeMarker === location.name && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div className="p-2">
                <h3 className="font-medium text-gray-900">{location.name}</h3>
                {location.aqi && (
                  <>
                    <p className="text-sm text-gray-600">AQI: {location.aqi}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getAQILabel(location.aqi)}
                    </p>
                  </>
                )}
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}
