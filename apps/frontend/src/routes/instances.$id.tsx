import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getInstance, getInstanceMetrics, getInstanceHeartbeats, sendCommand, type Instance, type Metric, type Heartbeat } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DebugPanel } from "@/components/debug-panel";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/instances/$id")({
  component: InstanceDetail,
});

function InstanceDetail() {
  const { id } = Route.useParams();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const { connected, lastMessage } = useWebSocket();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [inst, mets, hbs] = await Promise.all([
          getInstance(id),
          getInstanceMetrics(id),
          getInstanceHeartbeats(id),
        ]);
        setInstance(inst);
        setMetrics(mets);
        setHeartbeats(hbs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch instance data"));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Update instance from WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.instanceId === id && lastMessage.data.instance) {
      setInstance(lastMessage.data.instance);
    }
  }, [lastMessage, id]);

  const handleSendCommand = async () => {
    if (!command.trim()) return;

    try {
      setSending(true);
      await sendCommand(id, command);
      setCommand("");
    } catch (err) {
      console.error("Failed to send command:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading instance details...</div>
      </div>
    );
  }

  if (error || !instance) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-destructive">Error: {error?.message || "Instance not found"}</div>
      </div>
    );
  }

  function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  function formatUptime(seconds: number | null): string {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-medium mb-2">{instance.name}</h1>
        <p className="text-sm text-muted-foreground">{instance.mqttClientId}</p>
      </div>

      {/* Instance Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Instance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={instance.status === "online" ? "default" : instance.status === "error" ? "destructive" : "secondary"}>
              {instance.status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Seen:</span>
            <span>{instance.lastSeen ? formatTimestamp(instance.lastSeen) : "Never"}</span>
          </div>
          {instance.enrolledAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Enrolled:</span>
              <span>{formatTimestamp(instance.enrolledAt)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatTimestamp(instance.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Send Command */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Send Command</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="command">Command</Label>
            <Input
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., get_status, get_metrics"
            />
          </div>
          <Button onClick={handleSendCommand} disabled={sending || !command.trim()}>
            {sending ? "Sending..." : "Send Command"}
          </Button>
        </CardContent>
      </Card>

      {/* Latest Metrics */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Latest Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.slice(0, 5).map((metric) => (
                <div key={metric.id} className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span>{formatTimestamp(metric.timestamp)}</span>
                  </div>
                  {metric.uptimeSeconds !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span>{formatUptime(metric.uptimeSeconds)}</span>
                    </div>
                  )}
                  {metric.version && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{metric.version}</span>
                    </div>
                  )}
                  {metric.stabilityScore !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stability:</span>
                      <span>{(metric.stabilityScore * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {metric.metadata && (
                    <div className="mt-2">
                      <span className="text-muted-foreground text-xs">Metadata:</span>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(JSON.parse(metric.metadata), null, 2)}
                      </pre>
                    </div>
                  )}
                  <Separator />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Heartbeats */}
      {heartbeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Heartbeats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {heartbeats.slice(0, 10).map((heartbeat) => (
                <div key={heartbeat.id} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{formatTimestamp(heartbeat.timestamp)}</span>
                  <Badge variant={heartbeat.status === "online" ? "default" : "secondary"}>
                    {heartbeat.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Panel */}
      <DebugPanel
        title="Debug: Instance Data"
        data={{
          instance,
          metrics: metrics.slice(0, 3),
          heartbeats: heartbeats.slice(0, 3),
          websocket: {
            connected,
            lastMessage: lastMessage?.instanceId === id ? lastMessage : null,
          },
        }}
      />
    </div>
  );
}

