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

interface DisasterOverviewProps {
  disaster: DisasterDetail;
}

export default function DisasterOverview({ disaster }: DisasterOverviewProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Overview</CardTitle>
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
                This overview was generated using AI and may not be fully
                accurate. Please verify important information.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        {disaster.report_analysis?.analysis?.executive_summary && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Executive Summary:</h3>
            <p>{disaster.report_analysis.analysis.executive_summary}</p>
          </div>
        )}
        {disaster.report_analysis?.latest_report_title && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Latest Situation Report:</h3>
            <p>{disaster.report_analysis.latest_report_title}</p>
            <p className="text-sm text-gray-600">
              Date:{" "}
              {new Date(
                disaster.report_analysis.latest_report_date
              ).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
