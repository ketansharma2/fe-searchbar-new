"use client";

import { Breadcrumb, type Crumb } from "./Breadcrumb";

/**
 * Standard CRUD page header: breadcrumb + title/description on the left,
 * action buttons on the right. Used by every list/detail/form page.
 */
export function PageHeader({
  breadcrumb,
  title,
  description,
  actions,
}: {
  breadcrumb?: Crumb[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
