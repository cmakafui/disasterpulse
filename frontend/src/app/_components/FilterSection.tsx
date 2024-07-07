import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSectionProps {
  filter: "all" | "alert" | "ongoing";
  onFilterChange: (value: "all" | "alert" | "ongoing") => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <h1 className="text-2xl font-bold">Latest Disasters</h1>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter disasters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="alert">Alert</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSection;
