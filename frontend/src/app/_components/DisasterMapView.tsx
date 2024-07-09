// DisasterMapView.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Disaster from "./Disaster";
import FilterSection from "./FilterSection";
import { getAllDisasters, filterDisasters } from "@/lib/actions";
import { DisasterList } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import GoogleMapSection from "./GoogleMapSection";
import { useInView } from "react-intersection-observer";

function DisasterMapView() {
  const [disasters, setDisasters] = useState<DisasterList[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "alert" | "ongoing">("all");
  const [hoveredDisasterId, setHoveredDisasterId] = useState<number | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const loadDisasters = useCallback(
    async (isInitial: boolean = false) => {
      if (!hasMore) return;
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      try {
        let data: DisasterList[];
        if (filter === "all") {
          data = await getAllDisasters(page);
        } else {
          data = await filterDisasters(filter, page);
        }
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setDisasters((prev) => (isInitial ? data : [...prev, ...data]));
          setPage((prev) => prev + 1);
        }
      } catch (err) {
        setError("Failed to load disasters");
      } finally {
        if (isInitial) {
          setIsInitialLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [filter, page, hasMore]
  );

  useEffect(() => {
    loadDisasters(true);
  }, [filter]);

  useEffect(() => {
    if (inView && !isInitialLoading && !isLoadingMore) {
      loadDisasters();
    }
  }, [inView, loadDisasters, isInitialLoading, isLoadingMore]);

  const handleFilterChange = (value: string) => {
    setFilter(value as "all" | "alert" | "ongoing");
    setDisasters([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  };

  const renderSkeletons = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="space-y-3 bg-white rounded-lg p-4 mb-4 border border-gray-200"
        >
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </>
  );

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (isInitialLoading) {
      return renderSkeletons();
    }

    if (disasters.length === 0 && !isLoadingMore) {
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
      <>
        <Disaster
          disasters={disasters}
          onHoverDisaster={setHoveredDisasterId}
        />
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-gray-600">
              Loading more disasters...
            </span>
          </div>
        )}
        <div ref={ref} className="h-10" />
      </>
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
