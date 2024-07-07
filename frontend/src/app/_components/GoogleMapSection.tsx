import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { DisasterList } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import MarkerItem from "./MarkerItem";
import MarkerDisasterItem from "./MarkerDisasterItem";

type Props = {
  disasters: DisasterList[];
  hoveredDisasterId: number | null;
};

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: 10,
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

function GoogleMapSection({ disasters, hoveredDisasterId }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      const bounds = new window.google.maps.LatLngBounds();
      disasters.forEach((disaster) => {
        if (disaster.primary_country?.location) {
          bounds.extend({
            lat: disaster.primary_country.location.lat,
            lng: disaster.primary_country.location.lon,
          });
        }
      });
      map.fitBounds(bounds);
      setMap(map);
    },
    [disasters]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (hoveredDisasterId && map) {
      const disaster = disasters.find((d) => d.id === hoveredDisasterId);
      if (disaster?.primary_country?.location) {
        map.panTo({
          lat: disaster.primary_country.location.lat,
          lng: disaster.primary_country.location.lon,
        });
        map.setZoom(6);
      }
    }
  }, [hoveredDisasterId, map, disasters]);

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading Google Maps</AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="w-full h-[600px]" />;
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={2}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {disasters.map((disaster) => (
          <MarkerItem
            key={disaster.id}
            disaster={disaster}
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
          />
        ))}
      </GoogleMap>
      {activeMarker !== null && (
        <MarkerDisasterItem
          disaster={disasters.find((d) => d.id === activeMarker)!}
          onClose={() => setActiveMarker(null)}
          onViewDetails={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      )}
    </div>
  );
}

export default GoogleMapSection;
