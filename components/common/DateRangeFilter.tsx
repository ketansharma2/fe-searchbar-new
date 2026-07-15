"use client";

import { useState } from "react";
import { CalendarRange, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DATE_RANGE_PRESETS } from "@/lib/dateRangePresets";

export interface DateRangeValue {
  from: string;
  to: string;
}

const CUSTOM = "custom";

function matchingPresetLabel(value: DateRangeValue): string | undefined {
  return DATE_RANGE_PRESETS.find((p) => {
    const preset = p.getValue();
    return preset.from === value.from && preset.to === value.to;
  })?.label;
}

/**
 * Shared date-range filter — a presets dropdown (Today/Last 7 days/etc.) that
 * applies immediately, plus a "Custom range…" option that reveals the two
 * date inputs only once chosen (or when the current value doesn't match any
 * preset, e.g. restored from the URL).
 */
export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}) {
  const hasRange = Boolean(value.from && value.to);
  const matchedPreset = hasRange ? matchingPresetLabel(value) : undefined;
  const [customOpen, setCustomOpen] = useState(hasRange && !matchedPreset);

  const selectValue = customOpen ? CUSTOM : (matchedPreset ?? "");

  function handlePresetChange(label: string) {
    if (label === CUSTOM) {
      setCustomOpen(true);
      return;
    }
    const preset = DATE_RANGE_PRESETS.find((p) => p.label === label);
    if (preset) {
      setCustomOpen(false);
      onChange(preset.getValue());
    }
  }

  function handleClear() {
    setCustomOpen(false);
    onChange({ from: "", to: "" });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Date range</Label>
        <Select value={selectValue} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-44">
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_PRESETS.map((p) => (
              <SelectItem key={p.label} value={p.label}>
                {p.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM}>Custom range…</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {customOpen && (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={value.from}
              max={value.to || undefined}
              onChange={(e) => onChange({ from: e.target.value, to: value.to })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={value.to}
              min={value.from || undefined}
              onChange={(e) => onChange({ from: value.from, to: e.target.value })}
            />
          </div>
        </>
      )}

      {hasRange && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  );
}
