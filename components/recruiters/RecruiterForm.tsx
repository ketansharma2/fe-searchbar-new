"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

/** Shared create/edit form used by the dedicated New and Edit pages. */
export function RecruiterForm({
  mode,
  recruiter,
}: {
  mode: "create" | "edit";
  recruiter?: Recruiter;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RecruiterFormValues>({
    resolver: zodResolver(buildRecruiterSchema(mode)),
    defaultValues: {
      name: recruiter?.name ?? "",
      email: recruiter?.email ?? "",
      password: "",
      dailyDownloadLimit: recruiter?.dailyDownloadLimit ?? 10,
      active: recruiter?.active ?? true,
    },
  });

  // Warn on browser close/refresh with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function save(values: RecruiterFormValues): Promise<Recruiter | null> {
    try {
      if (mode === "create") {
        const created = await recruiterApi.create(values);
        toast.success("Recruiter created");
        return created;
      }
      const payload: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        dailyDownloadLimit: values.dailyDownloadLimit,
        active: values.active,
      };
      if (values.password) payload.password = values.password;
      const updated = await recruiterApi.update(recruiter!.id, payload);
      toast.success("Recruiter updated");
      return updated;
    } catch (err) {
      if (!applyServerFieldErrors(err, setError)) {
        toast.error(getErrorMessage(err, "Could not save recruiter"));
      }
      return null;
    }
  }

  const onSave = handleSubmit(async (values) => {
    const result = await save(values);
    if (result) router.push(`/admin/recruiters/${result.id}`);
  });

  const onSaveAndContinue = handleSubmit(async (values) => {
    const result = await save(values);
    if (result && mode === "create") {
      reset({ name: "", email: "", password: "", dailyDownloadLimit: 10, active: true });
    } else if (result) {
      reset(values); // clear dirty state
    }
  });

  function cancel() {
    if (isDirty && !window.confirm("Discard unsaved changes?")) return;
    router.back();
  }

  const active = watch("active");

  return (
    <form onSubmit={onSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
              Password{" "}
              {mode === "edit" && (
                <span className="text-muted-foreground">(leave blank to keep)</span>
              )}
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
          <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
            <div>
              <Label htmlFor="active">Active</Label>
              <p className="text-xs text-muted-foreground">Inactive recruiters cannot log in.</p>
            </div>
            <Switch id="active" checked={active} onCheckedChange={(v) => setValue("active", v, { shouldDirty: true })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={cancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {mode === "create" && (
          <Button type="button" variant="secondary" onClick={onSaveAndContinue} disabled={isSubmitting}>
            {isSubmitting && <Spinner className="h-4 w-4" />}
            Save & add another
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-4 w-4" />}
          {mode === "create" ? "Create recruiter" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
