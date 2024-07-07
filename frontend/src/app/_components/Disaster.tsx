import React from "react";
import { DisasterList } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  AlertTriangleIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

interface Props {
  disasters: DisasterList[];
}

function Disaster({
  disasters,
  onHoverDisaster,
}: {
  disasters: DisasterList[];
  onHoverDisaster: (id: number | null) => void;
}) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {disasters.map((disaster) => (
        <Link href={`/disaster/${disaster.id}`} key={disaster.id}>
          <Card
            key={disaster.id}
            className="w-full hover:border hover:border-primary cursor-pointer rounded-lg"
            onMouseEnter={() => onHoverDisaster(disaster.id)}
            onMouseLeave={() => onHoverDisaster(null)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {disaster.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {disaster.primary_type?.name}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    disaster.status === "alert" ? "destructive" : "default"
                  }
                >
                  {disaster.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {new Date(disaster.date_event).toLocaleDateString()}
                </div>
                {disaster.primary_country && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {disaster.primary_country.name}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <AlertTriangleIcon className="w-4 h-4 mr-2" />
                  Last updated:{" "}
                  {new Date(disaster.date_changed).toLocaleString()}
                </div>
                {disaster.report_analysis?.analysis?.impact_analysis
                  ?.affected_people && (
                  <div className="flex items-center text-sm font-medium text-orange-600">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Affected people:{" "}
                    {disaster.report_analysis.analysis.impact_analysis.affected_people.toLocaleString()}
                  </div>
                )}
              </div>
              {disaster.report_analysis?.analysis?.executive_summary && (
                <div>
                  <h4 className="font-semibold mb-2">Executive Summary:</h4>
                  <p className="text-sm text-gray-600">
                    {disaster.report_analysis.analysis.executive_summary
                      .length > 200
                      ? `${disaster.report_analysis.analysis.executive_summary.substring(
                          0,
                          200
                        )}...`
                      : disaster.report_analysis.analysis.executive_summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default Disaster;
