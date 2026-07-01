"use client";

import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/dashboard/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role ?? ""} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
