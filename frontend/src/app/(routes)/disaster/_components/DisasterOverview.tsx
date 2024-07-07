import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DisasterOverviewProps {
  disaster: DisasterDetail;
}

export default function DisasterOverview({ disaster }: DisasterOverviewProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
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
