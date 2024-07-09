import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Bot } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimelineEvent {
  date: string;
  description: string;
}

interface DisasterTimelineProps {
  events: TimelineEvent[];
}

const DisasterTimeline: React.FC<DisasterTimelineProps> = ({ events }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Disaster Timeline</CardTitle>
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
                This timeline was generated using AI and may not be fully
                accurate. Please verify important information.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                </div>
                {index !== events.length - 1 && (
                  <div className="w-px h-full bg-gray-300 my-2"></div>
                )}
              </div>
              <div className="pb-8">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-800">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisasterTimeline;
