import React from "react";
import { DisasterDetail } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface NewsComponentProps {
  disaster: DisasterDetail;
}

export default function NewsComponent({ disaster }: NewsComponentProps) {
  const newsAnalysis = disaster.news_analysis;

  if (!newsAnalysis) return null;

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, content.lastIndexOf(" ", maxLength)) + "...";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">
          {newsAnalysis.latest_news_title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {new Date(newsAnalysis.latest_news_date).toLocaleDateString()}
        </p>
        <p className="mb-4">
          {truncateContent(newsAnalysis.latest_news_content, 200)}
        </p>
        {newsAnalysis.latest_news_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={newsAnalysis.latest_news_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              Read Full Article
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
