import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ImpactAnalysisProps {
  disaster: DisasterDetail;
}

export default function ImpactAnalysis({ disaster }: ImpactAnalysisProps) {
  const impact = disaster.report_analysis?.analysis?.impact_analysis;

  if (!impact) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Impact Analysis</CardTitle>
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
