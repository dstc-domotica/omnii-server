import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { g as getSettings, C as Card, a as CardContent, b as CardHeader, c as CardTitle, B as Badge, u as updateSettings } from "./api-CdZLBQVN.mjs";
import { u as useTheme, B as Button } from "./router-CLITfZHp.mjs";
import { L as Label, I as Input } from "./label-EgOV3Hn-.mjs";
import "@base-ui/react/merge-props";
import "@base-ui/react/use-render";
import "class-variance-authority";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@base-ui/react/button";
import "clsx";
import "tailwind-merge";
import "@base-ui/react/separator";
import "sonner";
import "@base-ui/react/input";
function SettingsPage() {
  const {
    theme,
    toggleTheme
  } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [serverHost, setServerHost] = useState("");
  const [grpcPort, setGrpcPort] = useState("50051");
  const [grpcServer, setGrpcServer] = useState(void 0);
  useEffect(() => {
    fetchSettings();
  }, []);
  async function fetchSettings() {
    try {
      setLoading(true);
      setError(null);
      const settings = await getSettings();
      if (settings.serverHost) {
        setServerHost(settings.serverHost);
      }
      if (settings.grpcPort) {
        setGrpcPort(String(settings.grpcPort));
      }
      if (settings.grpcServer) {
        setGrpcServer(settings.grpcServer);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch settings"));
    } finally {
      setLoading(false);
    }
  }
  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await updateSettings({
        serverHost,
        grpcPort: parseInt(grpcPort, 10) || 50051
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3e3);
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to save settings"));
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto p-4", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: "Loading settings..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto p-4 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-medium mb-2", children: "Settings" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Configure server settings" })
    ] }),
    error && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-4 text-destructive", children: error.message }) }),
    success && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-4 text-green-600 dark:text-green-400", children: "Settings saved successfully!" }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Appearance" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Dark Mode" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Toggle between light and dark theme" })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: toggleTheme, children: theme === "dark" ? "Light" : "Dark" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Server Configuration" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Configure the server hostname or IP address. This is used for enrollment codes so that Home Assistant add-ons know where to connect." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "server-host", children: "Server Host" }),
          /* @__PURE__ */ jsx(Input, { id: "server-host", value: serverHost, onChange: (e) => setServerHost(e.target.value), placeholder: "e.g., 192.168.1.100 or myserver.local" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "The public hostname or IP address of this server (without port or protocol)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "grpc-port", children: "gRPC Port" }),
          /* @__PURE__ */ jsx(Input, { id: "grpc-port", type: "number", value: grpcPort, onChange: (e) => setGrpcPort(e.target.value), placeholder: "50051" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "The port the gRPC server listens on (default: 50051)" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: saving, children: saving ? "Saving..." : "Save" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "gRPC Server Status" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        grpcServer ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Status:" }),
            /* @__PURE__ */ jsx(Badge, { variant: grpcServer.running ? "default" : "destructive", children: grpcServer.running ? "Running" : "Stopped" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Connected Addons:" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: grpcServer.connectedAddons })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Active Sessions:" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: grpcServer.activeSessions })
          ] }),
          serverHost && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "gRPC Address:" }),
            /* @__PURE__ */ jsxs("code", { className: "text-sm bg-muted px-2 py-1 rounded", children: [
              serverHost,
              ":",
              grpcPort
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Unable to fetch gRPC server status" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: fetchSettings, children: "Refresh Status" })
      ] })
    ] })
  ] });
}
export {
  SettingsPage as component
};
