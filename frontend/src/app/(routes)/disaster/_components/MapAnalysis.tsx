import React from "react";
import Image from "next/image";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MapAnalysisProps {
  disaster: DisasterDetail;
}

export default function MapAnalysis({ disaster }: MapAnalysisProps) {
  const mapAnalysis = disaster.map_analysis?.analysis;
  const mapImageUrl = disaster.map_analysis?.latest_map_image_url;

  if (!mapAnalysis) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Map Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {mapImageUrl && (
          <div className="mb-6">
            <Image
              src={mapImageUrl}
              alt="Disaster Map"
              width={800}
              height={600}
              layout="responsive"
              className="rounded-lg"
            />
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Map Summary:</h3>
          <p>{mapAnalysis.disaster_extent}</p>
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
          <h3 className="font-semibold mb-2">Key Findings:</h3>
          <ul className="list-disc pl-5">
            {mapAnalysis.key_findings.map((insight, index) => (
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

        {disaster.map_analysis?.latest_map_url && (
          <Button variant="outline" className="mt-4" asChild>
            <a
              href={disaster.map_analysis.latest_map_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Full Map
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
