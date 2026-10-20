"use client";

import type { EventType } from "@/types";
import { EVENT_TYPES } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EventFiltersValue {
  search: string;
  type: EventType | "";
  dateFrom: string;
  dateTo: string;
}

interface EventFiltersProps {
  value: EventFiltersValue;
  onChange: (value: EventFiltersValue) => void;
  onReset: () => void;
}

export function EventFilters({ value, onChange, onReset }: EventFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div className="space-y-1 lg:col-span-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name or description"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label>Type</Label>
        <Select
          value={value.type || "ALL"}
          onValueChange={(v) =>
            onChange({ ...value, type: v === "ALL" ? "" : (v as EventType) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="dateFrom">From</Label>
        <Input
          id="dateFrom"
          type="date"
          value={value.dateFrom}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="dateTo">To</Label>
        <Input
          id="dateTo"
          type="date"
          value={value.dateTo}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
        />
      </div>

      <Button variant="ghost" size="sm" onClick={onReset} className="sm:col-span-2 lg:col-span-5 lg:justify-self-start">
        Clear filters
      </Button>
    </div>
  );
}