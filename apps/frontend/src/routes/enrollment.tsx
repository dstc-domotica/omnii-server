import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getEnrollmentCodes, createEnrollmentCode, type EnrollmentCode } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DebugPanel } from "@/components/debug-panel";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/enrollment")({
  component: EnrollmentPage,
});

function EnrollmentPage() {
  const [codes, setCodes] = useState<EnrollmentCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  async function fetchCodes() {
    try {
      setLoading(true);
      setError(null);
      const data = await getEnrollmentCodes();
      setCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch enrollment codes"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCode() {
    try {
      setCreating(true);
      setError(null);
      const hours = parseInt(expiresInHours, 10) || 24;
      const code = await createEnrollmentCode(hours);
      setNewCode(code.code);
      await fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create enrollment code"));
    } finally {
      setCreating(false);
    }
  }

  function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  function isExpired(code: EnrollmentCode): boolean {
    return Date.now() > code.expiresAt;
  }

  function isUsed(code: EnrollmentCode): boolean {
    return code.usedAt !== null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading enrollment codes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-medium mb-2">Enrollment Codes</h1>
        <p className="text-sm text-muted-foreground">Generate and manage enrollment codes for Home Assistant instances</p>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4 text-destructive">{error.message}</CardContent>
        </Card>
      )}

      {/* Create New Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Generate New Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expires">Expires In (hours)</Label>
            <Input
              id="expires"
              type="number"
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(e.target.value)}
              min="1"
              max="168"
            />
          </div>
          <Button onClick={handleCreateCode} disabled={creating}>
            {creating ? "Creating..." : "Generate Code"}
          </Button>
          {newCode && (
            <div className="p-4 bg-muted rounded border">
              <p className="text-sm font-medium mb-2">New Enrollment Code:</p>
              <p className="text-2xl font-mono font-bold">{newCode}</p>
              <p className="text-xs text-muted-foreground mt-2">Share this code with the Home Assistant instance to enroll</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No active enrollment codes</div>
          ) : (
            <div className="space-y-4">
              {codes.map((code) => (
                <div key={code.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-mono font-bold">{code.code}</span>
                        {isUsed(code) && <Badge variant="secondary">Used</Badge>}
                        {isExpired(code) && !isUsed(code) && <Badge variant="destructive">Expired</Badge>}
                        {!isExpired(code) && !isUsed(code) && <Badge variant="default">Active</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created: {formatTimestamp(code.createdAt)} | Expires: {formatTimestamp(code.expiresAt)}
                      </div>
                      {code.usedAt && (
                        <div className="text-xs text-muted-foreground">
                          Used: {formatTimestamp(code.usedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Panel */}
      <DebugPanel
        title="Debug: API Response"
        data={{
          codes,
          newCode,
          error: error?.message || null,
        }}
      />
    </div>
  );
}

