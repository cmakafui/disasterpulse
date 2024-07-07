import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface NeedsAnalysisProps {
  disaster: DisasterDetail;
}

export default function NeedsAnalysis({ disaster }: NeedsAnalysisProps) {
  const needs = disaster.report_analysis?.analysis?.needs_analysis;

  if (!needs) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Needs Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {needs.immediate_needs && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Immediate Needs:</h3>
            <ul className="list-disc pl-5">
              {needs.immediate_needs.map((need, index) => (
                <li key={index}>{need}</li>
              ))}
            </ul>
          </div>
        )}
        {needs.long_term_needs && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Long-term Needs:</h3>
            <ul className="list-disc pl-5">
              {needs.long_term_needs.map((need, index) => (
                <li key={index}>{need}</li>
              ))}
            </ul>
          </div>
        )}
        {needs.resource_gaps && (
          <div>
            <h3 className="font-semibold mb-2">Resource Gaps:</h3>
            <ul className="list-disc pl-5">
              {needs.resource_gaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
