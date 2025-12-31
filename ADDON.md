# Home Assistant Add-on Implementation Guide

This document describes how to implement the Home Assistant add-on that connects to the Omnii Server for centralized management, monitoring, and control.

## Overview

The add-on enables Home Assistant instances to:
1. Enroll with the Omnii Server using a numeric enrollment code
2. Establish MQTT connection for ongoing communication
3. Send periodic heartbeats, status updates, and metrics
4. Receive commands from the server

## Enrollment Process

### Step 1: Generate Enrollment Code

An administrator generates an enrollment code via the server API:

```bash
curl -X POST http://your-server:3001/enrollment-codes \
  -H "Content-Type: application/json" \
  -d '{"expiresInHours": 24}'
```

Response:
```json
{
  "code": "123456",
  "expiresAt": 1704067200000,
  "id": "abc123..."
}
```

### Step 2: Enroll Home Assistant Instance

The add-on sends a POST request to enroll:

```python
import requests
import json

SERVER_URL = "https://your-server:3001"  # Use HTTPS in production
ENROLLMENT_CODE = "123456"  # User enters this in add-on config
INSTANCE_NAME = "Home Assistant - Living Room"  # User configurable

response = requests.post(
    f"{SERVER_URL}/enroll",
    json={
        "code": ENROLLMENT_CODE,
        "name": INSTANCE_NAME
    },
    verify=True  # Verify SSL certificate
)

if response.status_code == 200:
    enrollment_data = response.json()
    # Store enrollment_data for MQTT connection
    # {
    #   "instanceId": "...",
    #   "mqttClientId": "...",
    #   "mqttBrokerUrl": "mqtt://...",
    #   "topics": {
    #     "status": "ha-instances/{instanceId}/status",
    #     "heartbeat": "ha-instances/{instanceId}/heartbeat",
    #     "metrics": "ha-instances/{instanceId}/metrics",
    #     "commands": "server/{instanceId}/commands"
    #   }
    # }
else:
    # Handle error
    print(f"Enrollment failed: {response.text}")
```

## MQTT Setup

### Connection Configuration

After successful enrollment, connect to the MQTT broker:

```python
import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime

# From enrollment response
INSTANCE_ID = enrollment_data["instanceId"]
MQTT_CLIENT_ID = enrollment_data["mqttClientId"]
MQTT_BROKER_URL = enrollment_data["mqttBrokerUrl"]
TOPICS = enrollment_data["topics"]

# Parse broker URL (e.g., "mqtt://broker.example.com:1883")
from urllib.parse import urlparse
parsed = urlparse(MQTT_BROKER_URL)
broker_host = parsed.hostname
broker_port = parsed.port or 1883
use_tls = parsed.scheme == "mqtts"

# Create MQTT client
client = mqtt.Client(client_id=MQTT_CLIENT_ID)
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect

# Connect to broker
if use_tls:
    client.tls_set()  # Configure TLS if needed

client.connect(broker_host, broker_port, 60)
client.loop_start()
```

### MQTT Callbacks

```python
def on_connect(client, userdata, flags, rc):
    """Called when connected to MQTT broker"""
    if rc == 0:
        print("Connected to MQTT broker")
        # Subscribe to commands topic
        client.subscribe(TOPICS["commands"], qos=1)
    else:
        print(f"Failed to connect: {rc}")

def on_message(client, userdata, msg):
    """Handle incoming commands from server"""
    try:
        command = json.loads(msg.payload.decode())
        handle_command(command)
    except Exception as e:
        print(f"Error processing command: {e}")

def on_disconnect(client, userdata, rc):
    """Handle disconnection"""
    print("Disconnected from MQTT broker")
    # Implement reconnection logic
```

## Topic Structure

### Publishing to Server

#### Status Updates
Publish when instance status changes (startup, shutdown, error):

```python
def publish_status(status: str, version: str = None):
    """Publish status update"""
    payload = {
        "status": status,  # "online", "offline", "error"
        "version": version or get_home_assistant_version(),
        "timestamp": int(time.time() * 1000)
    }
    client.publish(TOPICS["status"], json.dumps(payload), qos=1, retain=False)
```

#### Heartbeats
Send periodic heartbeats (recommended: every 30-60 seconds):

```python
def send_heartbeat():
    """Send periodic heartbeat"""
    uptime = get_system_uptime()  # In seconds
    payload = {
        "status": "online",
        "uptime": uptime,
        "timestamp": int(time.time() * 1000)
    }
    client.publish(TOPICS["heartbeat"], json.dumps(payload), qos=1, retain=False)

# Schedule heartbeat (every 30 seconds)
import threading
def heartbeat_loop():
    while True:
        send_heartbeat()
        time.sleep(30)

heartbeat_thread = threading.Thread(target=heartbeat_loop, daemon=True)
heartbeat_thread.start()
```

#### Metrics
Send detailed metrics periodically (recommended: every 5 minutes):

```python
def send_metrics():
    """Send detailed metrics"""
    payload = {
        "uptimeSeconds": get_system_uptime(),
        "version": get_home_assistant_version(),
        "stabilityScore": calculate_stability_score(),  # 0.0 - 1.0
        "metadata": {
            "coreVersion": get_core_version(),
            "supervisorVersion": get_supervisor_version(),
            "osVersion": get_os_version(),
            "totalDevices": get_total_devices_count(),
            "totalEntities": get_total_entities_count(),
            "lastUpdate": get_last_update_time(),
            "pendingUpdates": get_pending_updates_count(),
            # Add any other relevant metrics
        },
        "timestamp": int(time.time() * 1000)
    }
    client.publish(TOPICS["metrics"], json.dumps(payload), qos=1, retain=False)

# Schedule metrics (every 5 minutes)
def metrics_loop():
    while True:
        send_metrics()
        time.sleep(300)  # 5 minutes

metrics_thread = threading.Thread(target=metrics_loop, daemon=True)
metrics_thread.start()
```

### Receiving Commands from Server

Subscribe to commands topic and handle incoming commands:

```python
def handle_command(command: dict):
    """Handle command from server"""
    cmd_type = command.get("command")
    payload = command.get("payload", {})
    
    if cmd_type == "restart":
        # Restart Home Assistant
        restart_home_assistant()
        
    elif cmd_type == "update":
        # Trigger update process
        entity_id = payload.get("entity_id")
        update_entity(entity_id)
        
    elif cmd_type == "get_status":
        # Send current status
        publish_status("online", get_home_assistant_version())
        
    elif cmd_type == "get_metrics":
        # Send current metrics
        send_metrics()
        
    elif cmd_type == "check_updates":
        # Check for available updates
        check_for_updates()
        
    else:
        print(f"Unknown command: {cmd_type}")
```

## Complete Example Implementation

Here's a complete example combining all components:

```python
#!/usr/bin/env python3
"""
Home Assistant Omnii Add-on
Connects Home Assistant to Omnii Server for centralized management
"""

import paho.mqtt.client as mqtt
import requests
import json
import time
import threading
from urllib.parse import urlparse
from typing import Optional, Dict

class OmniiAddon:
    def __init__(self, server_url: str, enrollment_code: str, instance_name: str):
        self.server_url = server_url
        self.enrollment_code = enrollment_code
        self.instance_name = instance_name
        self.enrollment_data: Optional[Dict] = None
        self.client: Optional[mqtt.Client] = None
        self.running = False
        
    def enroll(self) -> bool:
        """Enroll with the server"""
        try:
            response = requests.post(
                f"{self.server_url}/enroll",
                json={
                    "code": self.enrollment_code,
                    "name": self.instance_name
                },
                verify=True,
                timeout=10
            )
            
            if response.status_code == 200:
                self.enrollment_data = response.json()
                print(f"Enrolled successfully. Instance ID: {self.enrollment_data['instanceId']}")
                return True
            else:
                print(f"Enrollment failed: {response.text}")
                return False
        except Exception as e:
            print(f"Enrollment error: {e}")
            return False
    
    def connect_mqtt(self) -> bool:
        """Connect to MQTT broker"""
        if not self.enrollment_data:
            print("Not enrolled. Call enroll() first.")
            return False
        
        parsed = urlparse(self.enrollment_data["mqttBrokerUrl"])
        broker_host = parsed.hostname
        broker_port = parsed.port or 1883
        
        self.client = mqtt.Client(
            client_id=self.enrollment_data["mqttClientId"]
        )
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        
        try:
            self.client.connect(broker_host, broker_port, 60)
            self.client.loop_start()
            return True
        except Exception as e:
            print(f"MQTT connection error: {e}")
            return False
    
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker")
            topics = self.enrollment_data["topics"]
            client.subscribe(topics["commands"], qos=1)
            self.running = True
            # Send initial status
            self.publish_status("online")
        else:
            print(f"Failed to connect: {rc}")
    
    def _on_message(self, client, userdata, msg):
        try:
            command = json.loads(msg.payload.decode())
            self.handle_command(command)
        except Exception as e:
            print(f"Error processing command: {e}")
    
    def _on_disconnect(self, client, userdata, rc):
        print("Disconnected from MQTT broker")
        self.running = False
    
    def publish_status(self, status: str):
        """Publish status update"""
        if not self.client or not self.running:
            return
        
        topics = self.enrollment_data["topics"]
        payload = {
            "status": status,
            "version": self._get_ha_version(),
            "timestamp": int(time.time() * 1000)
        }
        self.client.publish(topics["status"], json.dumps(payload), qos=1)
    
    def send_heartbeat(self):
        """Send heartbeat"""
        if not self.client or not self.running:
            return
        
        topics = self.enrollment_data["topics"]
        payload = {
            "status": "online",
            "uptime": self._get_uptime(),
            "timestamp": int(time.time() * 1000)
        }
        self.client.publish(topics["heartbeat"], json.dumps(payload), qos=1)
    
    def send_metrics(self):
        """Send detailed metrics"""
        if not self.client or not self.running:
            return
        
        topics = self.enrollment_data["topics"]
        payload = {
            "uptimeSeconds": self._get_uptime(),
            "version": self._get_ha_version(),
            "stabilityScore": self._calculate_stability(),
            "metadata": self._get_metadata(),
            "timestamp": int(time.time() * 1000)
        }
        self.client.publish(topics["metrics"], json.dumps(payload), qos=1)
    
    def handle_command(self, command: dict):
        """Handle command from server"""
        cmd_type = command.get("command")
        payload = command.get("payload", {})
        
        print(f"Received command: {cmd_type}")
        
        if cmd_type == "get_status":
            self.publish_status("online")
        elif cmd_type == "get_metrics":
            self.send_metrics()
        # Add more command handlers as needed
    
    def start(self):
        """Start the add-on"""
        if not self.enroll():
            return False
        
        if not self.connect_mqtt():
            return False
        
        # Start heartbeat loop
        def heartbeat_loop():
            while self.running:
                self.send_heartbeat()
                time.sleep(30)
        
        # Start metrics loop
        def metrics_loop():
            while self.running:
                self.send_metrics()
                time.sleep(300)  # 5 minutes
        
        threading.Thread(target=heartbeat_loop, daemon=True).start()
        threading.Thread(target=metrics_loop, daemon=True).start()
        
        return True
    
    def stop(self):
        """Stop the add-on"""
        self.running = False
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
    
    # Helper methods (implement based on Home Assistant API)
    def _get_ha_version(self) -> str:
        # Use Home Assistant API to get version
        return "2024.1.0"  # Example
    
    def _get_uptime(self) -> int:
        # Get system uptime in seconds
        return int(time.time())  # Example
    
    def _calculate_stability(self) -> float:
        # Calculate stability score (0.0 - 1.0)
        return 0.95  # Example
    
    def _get_metadata(self) -> dict:
        # Get additional metadata
        return {
            "coreVersion": "2024.1.0",
            "supervisorVersion": "2024.01.0",
            # Add more metadata
        }


# Usage
if __name__ == "__main__":
    addon = OmniiAddon(
        server_url="https://your-server:3001",
        enrollment_code="123456",  # From user configuration
        instance_name="Home Assistant - Main"
    )
    
    if addon.start():
        try:
            # Keep running
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            addon.stop()
    else:
        print("Failed to start add-on")
```

## Home Assistant Add-on Configuration

For a proper Home Assistant add-on, create the following structure:

```
omnii-addon/
├── config.json          # Add-on configuration
├── Dockerfile           # Add-on container
├── run.sh              # Entry point script
└── omnii_addon.py      # Main add-on code (from example above)
```

### config.json

```json
{
  "name": "Omnii Server Connector",
  "version": "1.0.0",
  "slug": "omnii-connector",
  "description": "Connect Home Assistant to Omnii Server for centralized management",
  "arch": ["armhf", "armv7", "aarch64", "amd64", "i386"],
  "startup": "application",
  "boot": "auto",
  "options": {
    "server_url": "https://your-server:3001",
    "enrollment_code": "",
    "instance_name": ""
  },
  "schema": {
    "server_url": "url",
    "enrollment_code": "str",
    "instance_name": "str"
  }
}
```

## Security Considerations

1. **HTTPS for Enrollment**: Always use HTTPS for the enrollment endpoint
2. **MQTT Authentication**: Implement MQTT username/password authentication if required
3. **TLS for MQTT**: Use `mqtts://` (MQTT over TLS) in production
4. **Certificate Validation**: Verify SSL certificates in production
5. **Secure Storage**: Store enrollment data securely (encrypted configuration)

## Error Handling

Implement robust error handling for:
- Network connectivity issues
- MQTT broker disconnections
- Invalid enrollment codes
- Server unavailability
- Message parsing errors

## Testing

Test the add-on by:
1. Generating an enrollment code via server API
2. Enrolling the add-on
3. Verifying MQTT connection
4. Checking that heartbeats and metrics are received by the server
5. Sending test commands from the server

## Troubleshooting

- **Enrollment fails**: Check server URL, enrollment code validity, and network connectivity
- **MQTT connection fails**: Verify broker URL, port, and firewall settings
- **Messages not received**: Check topic names match exactly, verify QoS settings
- **Commands not working**: Ensure subscription to commands topic is successful

