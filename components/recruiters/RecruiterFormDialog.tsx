"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { buildRecruiterSchema, type RecruiterFormValues } from "@/lib/validation/recruiter";
import { recruiterApi } from "@/services/recruiter.service";
import { getErrorMessage } from "@/services/api";
import { applyServerFieldErrors } from "@/lib/formErrors";
import type { Recruiter } from "@/types";

export function RecruiterFormDialog({
  open,
  onOpenChange,
  recruiter,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present = edit mode; absent = create mode. */
  recruiter?: Recruiter | null;
  onSaved: () => void;
}) {
  const mode = recruiter ? "edit" : "create";

  const form = useForm<RecruiterFormValues>({
    resolver: zodResolver(buildRecruiterSchema(mode)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      dailyDownloadLimit: 10,
      active: true,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  // Reset the form whenever the dialog opens or the target recruiter changes.
  useEffect(() => {
    if (!open) return;
    reset({
      name: recruiter?.name ?? "",
      email: recruiter?.email ?? "",
      password: "",
      dailyDownloadLimit: recruiter?.dailyDownloadLimit ?? 10,
      active: recruiter?.active ?? true,
    });
  }, [open, recruiter, reset]);

  async function onSubmit(values: RecruiterFormValues) {
    try {
      if (mode === "create") {
        await recruiterApi.create(values);
        toast.success("Recruiter created");
      } else if (recruiter) {
        const payload: Record<string, unknown> = {
          name: values.name,
          email: values.email,
          dailyDownloadLimit: values.dailyDownloadLimit,
          active: values.active,
        };
        if (values.password) payload.password = values.password;
        await recruiterApi.update(recruiter.id, payload);
        toast.success("Recruiter updated");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      // Surface per-field server errors inline; otherwise a toast.
      if (!applyServerFieldErrors(err, setError)) {
        toast.error(getErrorMessage(err, "Could not save recruiter"));
      }
    }
  }

  const active = watch("active");

  return (
    <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Recruiter" : "Edit Recruiter"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a recruiter account and set their daily download limit."
              : "Update the recruiter's details. Leave password blank to keep it unchanged."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Jane Doe" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="jane@mavenjobs.in" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {mode === "edit" && <span className="text-muted-foreground">(leave blank to keep)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyDownloadLimit">Daily download limit</Label>
            <Input
              id="dailyDownloadLimit"
              type="number"
              min={0}
              {...register("dailyDownloadLimit", { valueAsNumber: true })}
            />
            {errors.dailyDownloadLimit && (
              <p className="text-xs text-destructive">{errors.dailyDownloadLimit.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive recruiters cannot log in.
              </p>
            </div>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={(v) => setValue("active", v)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {mode === "create" ? "Create recruiter" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
