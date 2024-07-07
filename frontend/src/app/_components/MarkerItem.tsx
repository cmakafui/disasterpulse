import React from "react";
import { MarkerF, OverlayView } from "@react-google-maps/api";
import { DisasterList } from "@/lib/types";

type MarkerItemProps = {
  disaster: DisasterList;
  activeMarker: number | null;
  setActiveMarker: (id: number | null) => void;
};

const MarkerItem: React.FC<MarkerItemProps> = ({
  disaster,
  activeMarker,
  setActiveMarker,
}) => {
  if (!disaster.primary_country?.location) {
    return null;
  }

  const handleMarkerClick = () => {
    setActiveMarker(activeMarker === disaster.id ? null : disaster.id);
  };

  return (
    <MarkerF
      position={{
        lat: disaster.primary_country.location.lat,
        lng: disaster.primary_country.location.lon,
      }}
      onClick={handleMarkerClick}
      icon={{
        url:
          disaster.status === "alert" ? "/alert-icon.png" : "/ongoing-icon.png",
        scaledSize: new window.google.maps.Size(30, 30),
      }}
    ></MarkerF>
  );
};

export default MarkerItem;
