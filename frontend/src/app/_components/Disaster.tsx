// Disaster.tsx
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
import {
  Calendar,
  MapPin,
  AlertTriangle,
  Users,
  ArrowRight,
  Database,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  disasters: DisasterList[];
  onHoverDisaster: (id: number | null) => void;
}

function Disaster({ disasters, onHoverDisaster }: Props) {
  return (
    <div className="space-y-6">
      {disasters.map((disaster) => (
        <Card
          key={disaster.id}
          className="w-full hover:shadow-lg transition-all duration-300 cursor-pointer rounded-lg border-2 border-gray-100 hover:border-primary overflow-hidden"
          onMouseEnter={() => onHoverDisaster(disaster.id)}
          onMouseLeave={() => onHoverDisaster(null)}
        >
          <CardHeader className="pb-2 bg-gradient-to-r from-primary to-purple-600 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold mb-1">
                  {disaster.name}
                </CardTitle>
                <CardDescription className="text-gray-200">
                  {disaster.primary_type?.name}
                </CardDescription>
              </div>
              <Badge
                variant={
                  disaster.status === "alert" ? "destructive" : "secondary"
                }
                className="ml-2 text-sm px-3 py-1"
              >
                {disaster.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {new Date(disaster.date_event).toLocaleDateString()}
                </div>
                {disaster.primary_country && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    {disaster.primary_country.name}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4 mr-2 text-primary" />
                  Last updated:{" "}
                  {new Date(disaster.date_changed).toLocaleString()}
                </div>
              </div>
              <div className="space-y-3">
                {disaster.report_analysis?.analysis?.impact_analysis
                  ?.affected_people && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    Affected people:{" "}
                    {disaster.report_analysis.analysis.impact_analysis.affected_people.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            {disaster.report_analysis?.analysis?.executive_summary && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-gray-700">
                  Executive Summary:
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {disaster.report_analysis.analysis.executive_summary.length >
                  200
                    ? `${disaster.report_analysis.analysis.executive_summary.substring(
                        0,
                        200
                      )}...`
                    : disaster.report_analysis.analysis.executive_summary}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 flex flex-col sm:flex-row justify-between items-center p-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Database className="w-4 h-4 text-primary" />
              <span>Data sourced from ReliefWeb</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Brain className="w-4 h-4 text-primary" />
              <span>Analyzed by PulseInsight AI</span>
            </div>
            <Link href={`/disaster/${disaster.id}`}>
              <Button variant="outline" size="sm" className="ml-4">
                View Insights
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default Disaster;
