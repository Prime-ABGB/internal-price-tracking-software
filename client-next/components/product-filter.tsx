"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface ProductFilterProps {
  onSearch: (query: string) => void;
  onDifferenceFilterChange?: (value: "all" | "gt0" | "lt0") => void;
}

export function ProductFilter({
  onSearch,
  onDifferenceFilterChange,
}: ProductFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [differenceFilter, setDifferenceFilter] = useState<
    "all" | "gt0" | "lt0"
  >("all");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
    setDifferenceFilter("all");
    onDifferenceFilterChange?.("all");
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6 mb-6">
      <div>
        <label className="text-sm font-medium">Search Products</label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">
          Filter by Price Difference
        </label>
        <select
          value={differenceFilter}
          onChange={(e) => {
            const value = e.target.value as "all" | "gt0" | "lt0";
            setDifferenceFilter(value);
            onDifferenceFilterChange?.(value);
          }}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All products</option>
          <option value="gt0">Prime price is higher</option>
          <option value="lt0">Prime price is lowest</option>
        </select>
      </div>

      {(searchQuery || differenceFilter !== "all") && (
        <button
          onClick={handleClear}
          className="w-full rounded-md border border-border bg-secondary/50 px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
