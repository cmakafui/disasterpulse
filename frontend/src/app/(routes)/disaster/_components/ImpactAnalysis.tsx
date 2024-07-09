import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImpactAnalysisProps {
  disaster: DisasterDetail;
}

export default function ImpactAnalysis({ disaster }: ImpactAnalysisProps) {
  const impact = disaster.report_analysis?.analysis?.impact_analysis;

  if (!impact) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Impact Analysis</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Bot className="h-4 w-4" />
                <span>AI-Generated</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                This impact analysis was generated using AI and may not be fully
                accurate. Please verify important information.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Affected People</h3>
            <p>{impact.affected_people?.toLocaleString() || "N/A"}</p>
          </div>
        </div>
        {impact.economic_impact && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Economic Impact:</h3>
            <p>{impact.economic_impact}</p>
          </div>
        )}
        {impact.infrastructure_damage && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Infrastructure Impact:</h3>
            <p>{impact.infrastructure_damage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
