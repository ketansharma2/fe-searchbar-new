import { toDateInputValue } from "./dateRange";

export interface DateRangePreset {
  label: string;
  getValue: () => { from: string; to: string };
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: "Today",
    getValue: () => {
      const today = toDateInputValue(new Date());
      return { from: today, to: today };
    },
  },
  {
    label: "Last 7 days",
    getValue: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      return { from: toDateInputValue(from), to: toDateInputValue(to) };
    },
  },
  {
    label: "Last 30 days",
    getValue: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      return { from: toDateInputValue(from), to: toDateInputValue(to) };
    },
  },
  {
    label: "This month",
    getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toDateInputValue(from), to: toDateInputValue(now) };
    },
  },
];
