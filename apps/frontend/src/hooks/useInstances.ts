import { useState, useEffect, useCallback } from "react";
import { getInstances, type Instance } from "@/lib/api";
import { wsClient, type WebSocketMessage } from "@/lib/websocket";

export function useInstances() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInstances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInstances();
      setInstances(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch instances"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();

    // Subscribe to WebSocket updates
    const unsubscribe = wsClient.onMessage((message: WebSocketMessage) => {
      if (message.type === "status_change" || message.type === "heartbeat" || message.type === "metrics") {
        // Update the instance in the list
        setInstances((prev) => {
          const index = prev.findIndex((inst) => inst.id === message.instanceId);
          if (index !== -1 && message.data.instance) {
            return prev.map((inst, i) => (i === index ? message.data.instance : inst));
          }
          return prev;
        });
      }
    });

    return unsubscribe;
  }, [fetchInstances]);

  return { instances, loading, error, refetch: fetchInstances };
}

