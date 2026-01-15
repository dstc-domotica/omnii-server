import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, B as Badge, j as getInstance, k as getInstanceMetrics, l as getInstanceHeartbeats, i as deleteInstance, s as sendCommand } from "./api-CdZLBQVN.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, w as wsClient } from "./dropdown-menu-DgKYLd9v.mjs";
import { R as Route, B as Button, S as Separator } from "./router-CLITfZHp.mjs";
import { L as Label, I as Input } from "./label-EgOV3Hn-.mjs";
import { A as AlertDialog, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-BcDv3iVx.mjs";
import { DotsThreeVerticalIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import "@base-ui/react/merge-props";
import "@base-ui/react/use-render";
import "class-variance-authority";
import "@base-ui/react/menu";
import "@tanstack/react-query";
import "@base-ui/react/button";
import "clsx";
import "tailwind-merge";
import "@base-ui/react/separator";
import "@base-ui/react/input";
import "@base-ui/react/alert-dialog";
function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  useEffect(() => {
    wsClient.connect();
    const unsubscribe = wsClient.onMessage((message) => {
      setLastMessage(message);
      if (message.type === "status_change" && message.instanceId === "") {
        setConnected(message.data.connected);
      }
    });
    setConnected(wsClient.isConnected());
    return () => {
      unsubscribe();
    };
  }, []);
  return { connected, lastMessage };
}
function InstanceDetail() {
  const {
    id
  } = Route.useParams();
  const navigate = useNavigate();
  const [instance, setInstance] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [heartbeats, setHeartbeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    lastMessage
  } = useWebSocket();
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [inst, mets, hbs] = await Promise.all([getInstance(id), getInstanceMetrics(id), getInstanceHeartbeats(id)]);
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
      toast.success("Command sent successfully");
    } catch (err) {
      console.error("Failed to send command:", err);
      toast.error("Failed to send command. Please try again.");
    } finally {
      setSending(false);
    }
  };
  const handleDelete = async (e) => {
    e.preventDefault();
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteInstance(id);
      setDeleteDialogOpen(false);
      toast.success(`Instance "${instance?.name}" deleted successfully`);
      navigate({
        to: "/"
      });
    } catch (err) {
      console.error("Failed to delete instance:", err);
      toast.error("Failed to delete instance. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto p-4", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: "Loading instance details..." }) });
  }
  if (error || !instance) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-destructive", children: [
      "Error: ",
      error?.message || "Instance not found"
    ] }) });
  }
  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
  function formatUptime(seconds) {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto p-4 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h1", { className: "text-2xl font-medium mb-2", children: instance.name }) }),
      /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { render: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm" }), children: /* @__PURE__ */ jsx(DotsThreeVerticalIcon, { className: "size-4" }) }),
        /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", children: /* @__PURE__ */ jsxs(DropdownMenuItem, { variant: "destructive", onClick: () => {
          setDeleteDialogOpen(true);
        }, children: [
          /* @__PURE__ */ jsx(TrashIcon, { className: "size-4 mr-2" }),
          "Delete Instance"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete Instance" }),
          /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
            "Are you sure you want to delete ",
            /* @__PURE__ */ jsx("strong", { children: instance.name }),
            "? This action cannot be undone and will delete all associated data including metrics and heartbeats."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: isDeleting, children: "Cancel" }),
          /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDelete, disabled: isDeleting, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: isDeleting ? "Deleting..." : "Delete" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Instance Information" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Status:" }),
          /* @__PURE__ */ jsx(Badge, { variant: instance.status === "online" ? "default" : instance.status === "error" ? "destructive" : "secondary", children: instance.status })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Last Seen:" }),
          /* @__PURE__ */ jsx("span", { children: instance.lastSeen ? formatTimestamp(instance.lastSeen) : "Never" })
        ] }),
        instance.enrolledAt && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Enrolled:" }),
          /* @__PURE__ */ jsx("span", { children: formatTimestamp(instance.enrolledAt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Created:" }),
          /* @__PURE__ */ jsx("span", { children: formatTimestamp(instance.createdAt) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Send Command" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "command", children: "Command" }),
          /* @__PURE__ */ jsx(Input, { id: "command", value: command, onChange: (e) => setCommand(e.target.value), placeholder: "e.g., get_status, get_metrics" })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSendCommand, disabled: sending || !command.trim(), children: sending ? "Sending..." : "Send Command" })
      ] })
    ] }),
    metrics.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Latest Metrics" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: metrics.slice(0, 5).map((metric) => /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Timestamp:" }),
          /* @__PURE__ */ jsx("span", { children: formatTimestamp(metric.timestamp) })
        ] }),
        metric.uptimeSeconds !== null && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Uptime:" }),
          /* @__PURE__ */ jsx("span", { children: formatUptime(metric.uptimeSeconds) })
        ] }),
        metric.version && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Version:" }),
          /* @__PURE__ */ jsx("span", { children: metric.version })
        ] }),
        metric.stabilityScore !== null && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Stability:" }),
          /* @__PURE__ */ jsxs("span", { children: [
            (metric.stabilityScore * 100).toFixed(1),
            "%"
          ] })
        ] }),
        metric.metadata && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "Metadata:" }),
          /* @__PURE__ */ jsx("pre", { className: "text-xs bg-muted p-2 rounded mt-1 overflow-auto", children: JSON.stringify(JSON.parse(metric.metadata), null, 2) })
        ] }),
        /* @__PURE__ */ jsx(Separator, {})
      ] }, metric.id)) }) })
    ] }),
    heartbeats.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Recent Heartbeats" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-2 text-sm", children: heartbeats.slice(0, 10).map((heartbeat) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: formatTimestamp(heartbeat.timestamp) }),
        /* @__PURE__ */ jsx(Badge, { variant: heartbeat.status === "online" ? "default" : "secondary", children: heartbeat.status })
      ] }, heartbeat.id)) }) })
    ] })
  ] });
}
export {
  InstanceDetail as component
};
