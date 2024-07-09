import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisasterDetail } from "@/lib/types";
import { ExternalLink, Heart } from "lucide-react";

interface SourceInfoProps {
  disaster: DisasterDetail;
}

const SourceInfo: React.FC<SourceInfoProps> = ({ disaster }) => {
  const sources = disaster.report_analysis?.latest_report_sources || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Last updated: {new Date(disaster.date_changed).toLocaleString()}
        </p>
        {sources.map((source, index) => (
          <div key={source.id} className="mb-6 pb-6 border-b last:border-b-0">
            <h3 className="font-semibold text-lg mb-2">{source.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{source.type.name}</p>
            <div className="flex space-x-2 mb-4">
              <Button size="sm" variant="outline" asChild>
                <a
                  href={source.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            </div>
            {source.disclaimer && (
              <p className="text-xs text-gray-500 italic">
                {source.disclaimer}
              </p>
            )}
          </div>
        ))}
        {disaster.report_analysis?.latest_report_url && (
          <Button variant="link" className="p-0 h-auto" asChild>
            <a
              href={disaster.report_analysis.latest_report_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View full report
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceInfo;
