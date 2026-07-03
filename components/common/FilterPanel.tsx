"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface SelectFilter {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

/**
 * A row of dropdown filters. Generic so every module's list page filters the
 * same way. (Extendable to date-range / numeric filters as modules need them.)
 */
export function FilterPanel({ filters }: { filters: SelectFilter[] }) {
  if (filters.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((f) => (
        <div key={f.key} className="min-w-40 space-y-1">
          <Label className="text-xs text-muted-foreground">{f.label}</Label>
          <Select value={f.value} onValueChange={f.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
