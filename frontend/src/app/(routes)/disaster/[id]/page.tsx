import React from "react";
import Link from "next/link";
import { getDisasterDetail } from "@/lib/actions";
import DisasterHeader from "../_components/DisasterHeader";
import DisasterOverview from "../_components/DisasterOverview";
import DisasterTimeline from "../_components/DisasterTimeline";
import ImpactAnalysis from "../_components/ImpactAnalysis";
import NeedsAnalysis from "../_components/NeedsAnalysis";
import MapAnalysis from "../_components/MapAnalysis";
import DisasterMap from "../_components/DisasterMap";
import SourceInfo from "../_components/SourceInfo";
import NewsComponent from "../_components/NewsComponent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ViewDisaster({
  params,
}: {
  params: { id: string };
}) {
  const disasterId = parseInt(params.id);
  const disaster = await getDisasterDetail(disasterId);

  const timelineEvents =
    disaster.report_analysis?.analysis?.timeline?.events || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/updates" passHref>
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Disasters
        </Button>
      </Link>

      <DisasterHeader disaster={disaster} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <DisasterOverview disaster={disaster} />
          <DisasterTimeline events={timelineEvents} />
          <ImpactAnalysis disaster={disaster} />
          <NeedsAnalysis disaster={disaster} />
          <MapAnalysis disaster={disaster} />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <NewsComponent disaster={disaster} />
          <DisasterMap disaster={disaster} />
          <SourceInfo disaster={disaster} />
        </div>
      </div>
    </div>
  );
}
