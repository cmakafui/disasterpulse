import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, HashIcon } from "lucide-react";

interface DisasterHeaderProps {
  disaster: DisasterDetail;
}

export default function DisasterHeader({ disaster }: DisasterHeaderProps) {
  return (
    <div className="border-b pb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{disaster.name}</h1>
          <p className="text-gray-600">{disaster.primary_type?.name}</p>
        </div>
        <Badge
          variant={disaster.status === "alert" ? "destructive" : "default"}
        >
          {disaster.status}
        </Badge>
      </div>
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>{new Date(disaster.date_event).toLocaleDateString()}</span>
        </div>
        {disaster.primary_country && (
          <div className="flex items-center">
            <MapPinIcon className="w-4 h-4 mr-2" />
            <span>{disaster.primary_country.name}</span>
          </div>
        )}
        {disaster.glide && (
          <div className="flex items-center">
            <HashIcon className="w-4 h-4 mr-2" />
            <span>{disaster.glide}</span>
          </div>
        )}
      </div>
    </div>
  );
}
