import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Instance } from "@/lib/api";

interface InstanceCardProps {
  instance: Instance;
}

function formatLastSeen(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "online":
      return "default";
    case "offline":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
  }
}

export function InstanceCard({ instance }: InstanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm">{instance.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{instance.mqttClientId}</p>
          </div>
          <Badge variant={getStatusVariant(instance.status)}>{instance.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last seen:</span>
            <span>{formatLastSeen(instance.lastSeen)}</span>
          </div>
          {instance.enrolledAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Enrolled:</span>
              <span>{new Date(instance.enrolledAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Link to="/instances/$id" params={{ id: instance.id }}>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

