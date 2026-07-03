"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FileSpreadsheet, Upload, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { candidateApi } from "@/services/candidate.service";
import { getErrorMessage } from "@/services/api";
import type { BulkUploadSummary } from "@/types";

const REQUIRED_COLUMNS = ["Name", "Email", "Mobile", "Location", "Skills", "Resume URL"];

interface ColumnMismatch {
  missingColumns: string[];
  detectedColumns: string[];
}

export function BulkUploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<BulkUploadSummary | null>(null);
  const [mismatch, setMismatch] = useState<ColumnMismatch | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pick(f: File | null) {
    setSummary(null);
    setMismatch(null);
    if (f && !/\.(xlsx|csv)$/i.test(f.name)) {
      toast.error("Please select an .xlsx or .csv file");
      return;
    }
    setFile(f);
  }

  async function startUpload() {
    if (!file) return;
    setUploading(true);
    setSummary(null);
    setMismatch(null);
    try {
      const result = await candidateApi.bulkUpload(file);
      setSummary(result);
      toast.success(`Upload complete: ${result.success} added, ${result.failed} skipped`);
    } catch (err) {
      // Surface the server's column-validation feedback if present.
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const data = err.response.data as {
          errors?: ColumnMismatch;
          message?: string;
        };
        if (data.errors?.missingColumns) {
          setMismatch(data.errors);
        } else {
          toast.error(data.message || "Upload failed");
        }
      } else {
        toast.error(getErrorMessage(err, "Upload failed"));
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a candidate spreadsheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center hover:bg-muted/40"
            onClick={() => fileRef.current?.click()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {file ? <FileSpreadsheet className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-sm font-medium">
                {file ? file.name : "Click to choose an .xlsx or .csv file"}
              </p>
              <p className="text-xs text-muted-foreground">Up to 20 MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Required columns:</span>{" "}
            {REQUIRED_COLUMNS.join(" · ")}. Common header synonyms are auto-detected
            (e.g. “Phone” → Mobile, “CV Link” → Resume URL).
          </div>

          <div className="flex justify-end">
            <Button onClick={startUpload} disabled={!file || uploading}>
              {uploading && <Spinner className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Start Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Column mismatch feedback */}
      {mismatch && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <XCircle className="h-5 w-5" /> Required columns missing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="mb-1 font-medium">Missing:</p>
              <div className="flex flex-wrap gap-1.5">
                {mismatch.missingColumns.map((c) => (
                  <Badge key={c} variant="destructive">{c}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 font-medium">Detected in your file:</p>
              <div className="flex flex-wrap gap-1.5">
                {mismatch.detectedColumns.map((c) => (
                  <Badge key={c} variant="muted">{c}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Upload Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Total rows</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold text-emerald-600">{summary.success}</p>
                <p className="text-xs text-muted-foreground">Imported</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold text-amber-600">{summary.failed}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>

            {summary.errors.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Skipped rows</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.errors.map((e, i) => (
                      <TableRow key={`${e.row}-${i}`}>
                        <TableCell className="tabular-nums">{e.row}</TableCell>
                        <TableCell className="text-muted-foreground">{e.email || "—"}</TableCell>
                        <TableCell>{e.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
