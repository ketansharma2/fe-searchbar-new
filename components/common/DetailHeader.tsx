"use client";

import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import { ActionMenu, type ActionMenuItem } from "./ActionMenu";
import { Button } from "@/components/ui/button";

/**
 * Standard detail-page header: back button + title + status badge on the
 * left, a primary action (usually Edit) + overflow menu on the right.
 * Destructive/state-changing actions belong in DangerZone, not here.
 */
export function DetailHeader({
  breadcrumb,
  title,
  description,
  backHref,
  status,
  primaryAction,
  actions,
}: {
  breadcrumb?: Crumb[];
  title: string;
  description?: string;
  backHref: string;
  status?: React.ReactNode;
  primaryAction?: { label: string; icon?: LucideIcon; onClick: () => void };
  actions?: ActionMenuItem[];
}) {
  const router = useRouter();

  return (
    <div className="mb-6 space-y-3">
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() => router.push(backHref)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {status}
            </div>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {(primaryAction || (actions && actions.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2">
            {primaryAction && (
              <Button onClick={primaryAction.onClick}>
                {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                {primaryAction.label}
              </Button>
            )}
            {actions && actions.length > 0 && <ActionMenu items={actions} label="More actions" />}
          </div>
        )}
      </div>
    </div>
  );
}
