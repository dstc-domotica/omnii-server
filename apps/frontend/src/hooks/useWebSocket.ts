import { useEffect, useState, useCallback } from "react";
import { wsClient, type WebSocketMessage } from "@/lib/websocket";

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    wsClient.connect();

    const unsubscribe = wsClient.onMessage((message) => {
      setLastMessage(message);
      if (message.type === "status_change" && message.instanceId === "") {
        setConnected(message.data.connected);
      }
    });

    // Check initial connection state
    setConnected(wsClient.isConnected());

    return () => {
      unsubscribe();
    };
  }, []);

  return { connected, lastMessage };
}

