import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

/** A titled card wrapping one section of a detail page. */
export function DetailCard({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export interface DetailField {
  label: string;
  value?: React.ReactNode;
}

/** A responsive label/value grid for facts inside a DetailCard. */
export function DetailSection({ fields }: { fields: DetailField[] }) {
  const shown = fields.filter(
    (f) => f.value !== undefined && f.value !== null && f.value !== ""
  );
  if (shown.length === 0) {
    return <p className="text-sm text-muted-foreground">No information provided.</p>;
  }
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
      {shown.map((f) => (
        <div key={f.label}>
          <dt className="text-xs text-muted-foreground">{f.label}</dt>
          <dd className="mt-0.5 text-sm font-medium break-words">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
