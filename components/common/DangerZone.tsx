"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface DangerZoneAction {
  label: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  /** Irreversible actions (e.g. delete) render in the destructive button style. Default true. */
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Standard bottom-of-detail-page container for destructive/state-changing
 * actions (delete, deactivate, archive). Keeps these out of the primary
 * header actions so they can't be triggered accidentally.
 */
export function DangerZone({ actions }: { actions: DangerZoneAction[] }) {
  if (actions.length === 0) return null;

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {actions.map((a) => (
          <div
            key={a.label}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{a.label}</p>
              <p className="text-sm text-muted-foreground">{a.description}</p>
            </div>
            <Button
              variant={a.destructive === false ? "outline" : "destructive"}
              onClick={a.onClick}
              disabled={a.disabled}
            >
              {a.buttonLabel}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
