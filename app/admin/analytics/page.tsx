"use client";

import { useState } from "react";
import {
  MapPin,
  Sparkles,
  Briefcase,
  Building2,
  Globe,
  TrendingUp,
  Users,
  Download,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatGrid, type Stat } from "@/components/dashboard/widgets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAnalyticsSummary, useAnalyticsBreakdown } from "@/hooks/useAnalytics";
import { exportToCsv } from "@/lib/csv";
import { getErrorMessage } from "@/services/api";
import type { AnalyticsBreakdownRow, AnalyticsDimension } from "@/types";

const DIMENSIONS: { value: AnalyticsDimension; label: string; icon: LucideIcon }[] = [
  { value: "location", label: "Location", icon: MapPin },
  { value: "skills", label: "Skills", icon: Sparkles },
  { value: "designation", label: "Designation", icon: Briefcase },
  { value: "company", label: "Company", icon: Building2 },
  { value: "portal", label: "Portal", icon: Globe },
  { value: "experience", label: "Experience", icon: TrendingUp },
];

function BreakdownTable({ dimension, location }: { dimension: AnalyticsDimension; location?: string }) {
  const { data, isLoading, isError, error, refetch } = useAnalyticsBreakdown(dimension, location);
  const rows = data ?? [];

  const columns: Column<AnalyticsBreakdownRow>[] = [
    { key: "label", header: dimension === "experience" ? "Experience" : "Label" },
    {
      key: "count",
      header: "Candidates",
      align: "right",
      render: (r) => <span className="tabular-nums">{r.count.toLocaleString()}</span>,
    },
  ];

  function doExport() {
    exportToCsv(
      `analytics_${dimension}.csv`,
      rows.map((r) => ({ label: r.label, count: r.count })),
      [
        { key: "label", header: "Label" },
        { key: "count", header: "Candidates" },
      ]
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={doExport} disabled={rows.length === 0}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.label}
        loading={isLoading}
        error={isError ? getErrorMessage(error, "Failed to load breakdown") : null}
        onRetry={() => refetch()}
        empty={
          <EmptyState icon={Users} title="No data" description="No candidates match this breakdown yet." />
        }
      />
    </div>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsDimension>("location");
  const [designationLocation, setDesignationLocation] = useState("");

  const { data: summary } = useAnalyticsSummary();

  const stats: Stat[] = [
    { label: "Total Candidates", value: summary ? summary.totalCandidates.toLocaleString() : "—", icon: Users },
    { label: "Added Today", value: summary ? summary.addedToday.toLocaleString() : "—", icon: TrendingUp },
    {
      label: "Added Yesterday",
      value: summary ? summary.addedYesterday.toLocaleString() : "—",
      icon: TrendingUp,
    },
    {
      label: "Added This Week",
      value: summary ? summary.addedThisWeek.toLocaleString() : "—",
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Analytics" }]}
        title="Analytics"
        description="Candidate database composition and growth."
      />

      <StatGrid stats={stats} />

      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalyticsDimension)}>
          <TabsList>
            {DIMENSIONS.map((d) => (
              <TabsTrigger key={d.value} value={d.value}>
                <d.icon className="h-4 w-4" /> {d.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {DIMENSIONS.map((d) => (
            <TabsContent key={d.value} value={d.value}>
              {d.value === "designation" && (
                <div className="mb-3 max-w-xs space-y-1">
                  <Label className="text-xs text-muted-foreground">Filter by location</Label>
                  <Input
                    placeholder="e.g. Bangalore"
                    value={designationLocation}
                    onChange={(e) => setDesignationLocation(e.target.value)}
                  />
                </div>
              )}
              {/* Only mount (and query) the active tab's table. */}
              {activeTab === d.value && (
                <BreakdownTable
                  dimension={d.value}
                  location={d.value === "designation" ? designationLocation || undefined : undefined}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
