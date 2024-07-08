// DisasterMapView.tsx
"use client";
import React, { useState, useEffect } from "react";
import Disaster from "./Disaster";
import FilterSection from "./FilterSection";
import { getAllDisasters, filterDisasters } from "@/lib/actions";
import { DisasterList } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import GoogleMapSection from "./GoogleMapSection";

function DisasterMapView() {
  const [disasters, setDisasters] = useState<DisasterList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "alert" | "ongoing">("all");
  const [hoveredDisasterId, setHoveredDisasterId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function loadDisasters() {
      setIsLoading(true);
      try {
        let data: DisasterList[];
        if (filter === "all") {
          data = await getAllDisasters();
        } else {
          data = await filterDisasters(filter);
        }
        setDisasters(data);
      } catch (err) {
        setError("Failed to load disasters");
      } finally {
        setIsLoading(false);
      }
    }

    loadDisasters();
  }, [filter]);

  const handleFilterChange = (value: string) => {
    setFilter(value as "all" | "alert" | "ongoing");
  };

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 bg-slate-200 animate-pulse rounded-lg p-4 mb-4"
        >
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ));
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (disasters.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No disasters found for the selected filter.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Disaster disasters={disasters} onHoverDisaster={setHoveredDisasterId} />
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <FilterSection filter={filter} onFilterChange={handleFilterChange} />
        <div>{renderContent()}</div>
      </div>
      <div className="lg:sticky lg:top-24 h-[calc(100vh-6rem)]">
        <GoogleMapSection
          disasters={disasters}
          hoveredDisasterId={hoveredDisasterId}
        />
      </div>
    </div>
  );
}

export default DisasterMapView;
