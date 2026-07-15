"use client";

import { Fragment } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** Renders a separator immediately before this item. */
  separatorBefore?: boolean;
}

/**
 * Overflow ("...") menu of secondary actions. Used both as a DataTable row
 * action and inside DetailHeader's action slot, so every list/detail page
 * gets the same menu instead of hand-rolling a DropdownMenu each time.
 */
export function ActionMenu({
  items,
  label = "Row actions",
}: {
  items: ActionMenuItem[];
  label?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, i) => (
          <Fragment key={item.label}>
            {item.separatorBefore && i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              destructive={item.destructive}
              disabled={item.disabled}
              onClick={item.onClick}
            >
              {item.icon && <item.icon />}
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
