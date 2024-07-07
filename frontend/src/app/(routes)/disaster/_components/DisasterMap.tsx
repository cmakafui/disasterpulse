"use client";

import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";

interface DisasterMapProps {
  disaster: DisasterDetail;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function DisasterMap({ disaster }: DisasterMapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const center = {
    lat: disaster.primary_country?.location?.lat || 0,
    lng: disaster.primary_country?.location?.lon || 0,
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disaster Location</CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
          <MarkerF position={center} />
        </GoogleMap>
      </CardContent>
    </Card>
  );
}
