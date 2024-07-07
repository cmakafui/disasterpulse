// Disaster.tsx
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
  onHoverDisaster: (id: number | null) => void;
}

function Disaster({ disasters, onHoverDisaster }: Props) {
  return (
    <div className="space-y-6">
      {disasters.map((disaster) => (
        <Link
          href={`/disaster/${disaster.id}`}
          key={disaster.id}
          className="block"
        >
          <Card
            className="w-full hover:shadow-md transition-all duration-300 cursor-pointer rounded-lg border-2 border-gray-100 hover:border-primary"
            onMouseEnter={() => onHoverDisaster(disaster.id)}
            onMouseLeave={() => onHoverDisaster(null)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold mb-1">
                    {disaster.name}
                  </CardTitle>
                  <CardDescription>
                    {disaster.primary_type?.name}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    disaster.status === "alert" ? "destructive" : "default"
                  }
                  className="ml-2"
                >
                  {disaster.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(disaster.date_event).toLocaleDateString()}
                </div>
                {disaster.primary_country && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {disaster.primary_country.name}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <AlertTriangleIcon className="w-4 h-4 mr-2 text-gray-400" />
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
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-gray-700">
                    Executive Summary:
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
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
