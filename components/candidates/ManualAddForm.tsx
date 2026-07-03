"use client";

import { useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { TagInput } from "@/components/common/TagInput";
import { candidateFormSchema, type CandidateFormValues } from "@/lib/validation/candidate";
import { candidateApi } from "@/services/candidate.service";
import { getErrorMessage } from "@/services/api";
import { applyServerFieldErrors } from "@/lib/formErrors";

const defaults: CandidateFormValues = {
  name: "",
  email: "",
  mobile: "",
  location: "",
  qualification: "",
  designation: "",
  gender: "",
  recentCompany: "",
  experience: "",
  relevantExp: "",
  portal: "",
  portalDate: "",
  applyDate: "",
  callingDate: "",
  currCTC: "",
  expCTC: "",
  feedback: "",
  jdBrief: "",
  resumeUrl: "",
  topSkills: [],
  skillsAll: [],
  companyNamesAll: [],
  education: [],
};

/** Fields that should be sent as-is (skip empty strings). */
const SCALAR_KEYS = [
  "name", "email", "mobile", "location", "qualification", "designation",
  "gender", "recentCompany", "experience", "relevantExp", "portal",
  "portalDate", "applyDate", "callingDate", "currCTC", "expCTC",
  "feedback", "jdBrief", "resumeUrl",
] as const;

export function ManualAddForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "education" });

  function pickFile(f: File | null) {
    setFileError(null);
    if (f && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Please select a PDF file");
      return;
    }
    setFile(f);
  }

  async function onSubmit(values: CandidateFormValues) {
    if (!file) {
      setFileError("A PDF resume is required");
      return;
    }

    const fd = new FormData();
    for (const key of SCALAR_KEYS) {
      const v = values[key];
      if (v !== undefined && v !== "") fd.append(key, String(v));
    }
    fd.append("topSkills", JSON.stringify(values.topSkills));
    fd.append("skillsAll", JSON.stringify(values.skillsAll));
    fd.append("companyNamesAll", JSON.stringify(values.companyNamesAll));
    fd.append("education", JSON.stringify(values.education));
    fd.append("resume", file);

    try {
      await candidateApi.createManual(fd);
      toast.success("Candidate added successfully");
      reset(defaults);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      if (!applyServerFieldErrors(err, setError)) {
        toast.error(getErrorMessage(err, "Could not add candidate"));
      }
    }
  }

  const err = (name: keyof CandidateFormValues) =>
    errors[name] ? (
      <p className="text-xs text-destructive">{String(errors[name]?.message)}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} placeholder="Full name" />
            {err("name")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="name@example.com" />
            {err("email")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile * (10 digits)</Label>
            <Input id="mobile" {...register("mobile")} placeholder="9876543210" />
            {err("mobile")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" {...register("gender")} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" {...register("location")} placeholder="City" />
            {err("location")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification *</Label>
            <Input id="qualification" {...register("qualification")} placeholder="e.g. B.Tech" />
            {err("qualification")}
          </div>
        </CardContent>
      </Card>

      {/* Job & experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job & Experience</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <Input id="designation" {...register("designation")} placeholder="e.g. Frontend Engineer" />
            {err("designation")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="recentCompany">Recent Company</Label>
            <Input id="recentCompany" {...register("recentCompany")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Input id="experience" {...register("experience")} placeholder='e.g. "2 years"' />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relevantExp">Relevant Experience (yrs)</Label>
            <Input id="relevantExp" type="number" step="0.1" {...register("relevantExp")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currCTC">Current CTC</Label>
            <Input id="currCTC" type="number" {...register("currCTC")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expCTC">Expected CTC</Label>
            <Input id="expCTC" type="number" {...register("expCTC")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portal">Portal / Source</Label>
            <Input id="portal" {...register("portal")} placeholder="e.g. Indeed" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portalDate">Portal Date</Label>
            <Input id="portalDate" type="date" {...register("portalDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applyDate">Apply Date</Label>
            <Input id="applyDate" type="date" {...register("applyDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callingDate">Calling Date</Label>
            <Input id="callingDate" type="date" {...register("callingDate")} />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills & Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Top Skills</Label>
            <Controller
              control={control}
              name="topSkills"
              render={({ field }) => (
                <TagInput value={field.value} onChange={field.onChange} placeholder="Add a top skill…" />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>All Skills</Label>
            <Controller
              control={control}
              name="skillsAll"
              render={({ field }) => (
                <TagInput value={field.value} onChange={field.onChange} placeholder="Add a skill…" />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Companies</Label>
            <Controller
              control={control}
              name="companyNamesAll"
              render={({ field }) => (
                <TagInput value={field.value} onChange={field.onChange} placeholder="Add a company…" />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Education</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ degree: "", institute: "", passingYear: "", score: "" })}
          >
            <Plus className="h-4 w-4" /> Add row
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No education rows added.</p>
          )}
          {fields.map((f, i) => (
            <div key={f.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
              <Input placeholder="Degree" {...register(`education.${i}.degree`)} />
              <Input placeholder="Institute" {...register(`education.${i}.institute`)} />
              <Input placeholder="Year" className="sm:w-24" {...register(`education.${i}.passingYear`)} />
              <Input placeholder="Score" className="sm:w-24" {...register(`education.${i}.score`)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional + resume */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional & Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea id="feedback" {...register("feedback")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jdBrief">JD Brief</Label>
            <Textarea id="jdBrief" {...register("jdBrief")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumeUrl">Resume URL (optional)</Label>
            <Input id="resumeUrl" {...register("resumeUrl")} placeholder="https://…" />
            {err("resumeUrl")}
          </div>

          <div className="space-y-2">
            <Label>Resume PDF *</Label>
            <div
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 hover:bg-muted/40"
              onClick={() => fileRef.current?.click()}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                {file ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {file ? file.name : "Click to upload a PDF resume"}
                </p>
                <p className="text-xs text-muted-foreground">PDF only, up to 10 MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset(defaults);
            setFile(null);
            setFileError(null);
          }}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-4 w-4" />}
          Add Candidate
        </Button>
      </div>
    </form>
  );
}
