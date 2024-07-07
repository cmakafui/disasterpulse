import React from "react";
import { DisasterList } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

type MarkerDisasterItemProps = {
  disaster: DisasterList;
  onClose: () => void;
  onViewDetails: () => void; // New prop for handling view details
};

const MarkerDisasterItem: React.FC<MarkerDisasterItemProps> = ({
  disaster,
  onClose,
  onViewDetails, // Destructure the new prop
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-96 absolute bottom-4 left-4 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{disaster.name}</CardTitle>
            <CardDescription>{disaster.primary_type?.name}</CardDescription>
          </div>
          <Badge
            variant={disaster.status === "alert" ? "destructive" : "default"}
          >
            {disaster.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>Event Date: {formatDate(disaster.date_event)}</span>
        </div>
        <div className="flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>{disaster.primary_country?.name}</span>
        </div>
        <div className="flex items-center text-sm">
          <Users className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>
            Affected People:{" "}
            {disaster.report_analysis?.analysis?.impact_analysis?.affected_people?.toLocaleString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button className="mr-2 w-1/2" onClick={onViewDetails}>
          View Details
        </Button>
        <Button variant="outline" className="ml-2 w-1/2" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MarkerDisasterItem;
