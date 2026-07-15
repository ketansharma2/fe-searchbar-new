"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * Standard destructive-action confirmation. Shows the record name and a
 * warning; never deletes immediately. Set `requireTypedConfirmation` for
 * high-impact deletes (recruiter, etc.) to require typing the record name.
 */
export function DeleteDialog({
  open,
  onOpenChange,
  recordName,
  resource = "record",
  warning,
  requireTypedConfirmation = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordName: string;
  resource?: string;
  warning?: string;
  requireTypedConfirmation?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  const [typed, setTyped] = useState("");
  // Reset the typed-confirmation input as the dialog transitions closed, without an effect
  // (React's "adjusting state during render" pattern — see react.dev/learn/you-might-not-need-an-effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setTyped("");
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${resource}?`}
      confirmLabel="Delete"
      destructive
      confirmDisabled={requireTypedConfirmation && typed !== recordName}
      onConfirm={onConfirm}
    >
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <p className="text-sm text-muted-foreground">
        You are about to permanently delete{" "}
        <span className="font-semibold text-foreground">{recordName}</span>.{" "}
        {warning ?? "This action cannot be undone."}
      </p>
      {requireTypedConfirmation && (
        <div className="space-y-2">
          <Label htmlFor="delete-confirm-input">
            Type <span className="font-semibold text-foreground">{recordName}</span> to confirm
          </Label>
          <Input
            id="delete-confirm-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
          />
        </div>
      )}
    </ConfirmDialog>
  );
}
