interface WebSocketClient {
  id: string;
  ws: WebSocket;
}

const clients = new Map<string, WebSocketClient>();

export function addWebSocketClient(id: string, ws: WebSocket): void {
  clients.set(id, { id, ws });
  console.log(`WebSocket client connected: ${id} (total: ${clients.size})`);
}

export function removeWebSocketClient(id: string): void {
  clients.delete(id);
  console.log(`WebSocket client disconnected: ${id} (total: ${clients.size})`);
}

export function broadcast(message: object): void {
  const messageStr = JSON.stringify(message);
  let sentCount = 0;
  
  clients.forEach((client) => {
    try {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
        sentCount++;
      }
    } catch (error) {
      console.error(`Failed to send message to client ${client.id}:`, error);
      clients.delete(client.id);
    }
  });

  if (sentCount > 0) {
    console.log(`Broadcasted message to ${sentCount} client(s)`);
  }
}

export function broadcastToInstance(instanceId: string, message: object): void {
  const messageStr = JSON.stringify({
    ...message,
    instanceId,
    timestamp: Date.now(),
  });
  
  let sentCount = 0;
  
  clients.forEach((client) => {
    try {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
        sentCount++;
      }
    } catch (error) {
      console.error(`Failed to send message to client ${client.id}:`, error);
      clients.delete(client.id);
    }
  });

  if (sentCount > 0) {
    console.log(`Broadcasted instance update for ${instanceId} to ${sentCount} client(s)`);
  }
}

export function handleWebSocket(req: Request): Response {
  const upgradeHeader = req.headers.get("Upgrade");
  if (upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const clientId = `ws-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const { socket, response } = Bun.upgradeWebSocket(req);

  socket.onopen = () => {
    addWebSocketClient(clientId, socket);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data as string);
      console.log(`Received message from client ${clientId}:`, data);
    } catch (error) {
      console.error(`Failed to parse message from client ${clientId}:`, error);
    }
  };

  socket.onclose = () => {
    removeWebSocketClient(clientId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    removeWebSocketClient(clientId);
  };

  return response;
}

