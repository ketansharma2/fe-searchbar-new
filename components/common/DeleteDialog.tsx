"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Standard destructive-action confirmation. Shows the record name and a
 * warning; never deletes immediately.
 */
export function DeleteDialog({
  open,
  onOpenChange,
  recordName,
  resource = "record",
  warning,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordName: string;
  resource?: string;
  warning?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>Delete {resource}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You are about to permanently delete{" "}
          <span className="font-semibold text-foreground">{recordName}</span>.{" "}
          {warning ?? "This action cannot be undone."}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading && <Spinner className="h-4 w-4" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
