import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MapAnalysisProps {
  disaster: DisasterDetail;
}

export default function MapAnalysis({ disaster }: MapAnalysisProps) {
  const mapAnalysis = disaster.map_analysis?.analysis;

  if (!mapAnalysis) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Map Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Executive Summary:</h3>
          <p>{mapAnalysis.executive_summary}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Affected Areas:</h3>
          <ul className="list-disc pl-5">
            {mapAnalysis.affected_areas.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Main Insights:</h3>
          <ul className="list-disc pl-5">
            {mapAnalysis.main_insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>

        {disaster.map_analysis?.latest_map_date && (
          <div className="mt-4 text-sm text-gray-600">
            Latest map date:{" "}
            {new Date(disaster.map_analysis?.latest_map_date).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
