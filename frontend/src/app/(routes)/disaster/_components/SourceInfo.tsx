import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisasterDetail } from "@/lib/types";

interface SourceInfoProps {
  disaster: DisasterDetail;
  sourceName: string;
}

const SourceInfo: React.FC<SourceInfoProps> = ({ disaster, sourceName }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Data sourced from: {sourceName}</p>
        <p>Last updated: {new Date(disaster.date_changed).toLocaleString()}</p>
        {disaster.url && (
          <Button variant="link" className="p-0 h-auto" asChild>
            <a href={disaster.url} target="_blank" rel="noopener noreferrer">
              View original source
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceInfo;
