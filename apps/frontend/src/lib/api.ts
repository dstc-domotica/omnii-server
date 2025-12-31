const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Instance {
  id: string;
  name: string;
  enrollmentCode: string | null;
  enrolledAt: number | null;
  mqttClientId: string;
  status: "online" | "offline" | "error";
  lastSeen: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface EnrollmentCode {
  id: string;
  code: string;
  instanceId: string | null;
  createdAt: number;
  expiresAt: number;
  usedAt: number | null;
}

export interface Metric {
  id: string;
  instanceId: string;
  timestamp: number;
  uptimeSeconds: number | null;
  version: string | null;
  stabilityScore: number | null;
  metadata: string | null;
}

export interface Heartbeat {
  id: string;
  instanceId: string;
  timestamp: number;
  status: string;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getInstances(): Promise<Instance[]> {
  return fetchAPI<Instance[]>("/instances");
}

export async function getInstance(id: string): Promise<Instance> {
  return fetchAPI<Instance>(`/instances/${id}`);
}

export async function getInstanceMetrics(id: string, limit: number = 100): Promise<Metric[]> {
  return fetchAPI<Metric[]>(`/instances/${id}/metrics?limit=${limit}`);
}

export async function getInstanceHeartbeats(id: string, limit: number = 100): Promise<Heartbeat[]> {
  return fetchAPI<Heartbeat[]>(`/instances/${id}/heartbeats?limit=${limit}`);
}

export async function sendCommand(instanceId: string, command: string, payload?: any): Promise<{ success: boolean; message: string }> {
  return fetchAPI(`/instances/${instanceId}/command`, {
    method: "POST",
    body: JSON.stringify({ command, payload: payload || {} }),
  });
}

export async function getEnrollmentCodes(): Promise<EnrollmentCode[]> {
  return fetchAPI<EnrollmentCode[]>("/enrollment-codes");
}

export async function createEnrollmentCode(expiresInHours: number = 24): Promise<EnrollmentCode> {
  return fetchAPI<EnrollmentCode>("/enrollment-codes", {
    method: "POST",
    body: JSON.stringify({ expiresInHours }),
  });
}

