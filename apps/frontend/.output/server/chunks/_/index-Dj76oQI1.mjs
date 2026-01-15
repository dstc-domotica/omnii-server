import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, h as getInstances, B as Badge, i as deleteInstance } from "./api-CdZLBQVN.mjs";
import { w as wsClient, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-DgKYLd9v.mjs";
import { useNavigate, Link } from "@tanstack/react-router";
import { B as Button } from "./router-CLITfZHp.mjs";
import { toast } from "sonner";
import { A as AlertDialog, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-BcDv3iVx.mjs";
import { DotsThreeVerticalIcon, TrashIcon } from "@phosphor-icons/react";
import "@base-ui/react/merge-props";
import "@base-ui/react/use-render";
import "class-variance-authority";
import "@base-ui/react/menu";
import "@tanstack/react-query";
import "@base-ui/react/button";
import "clsx";
import "tailwind-merge";
import "@base-ui/react/separator";
import "@base-ui/react/alert-dialog";
function useInstances() {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const unsubscribe = wsClient.onMessage((message) => {
      if (message.type === "instance_deleted") {
        setInstances((prev) => prev.filter((inst) => inst.id !== message.instanceId));
      } else if (message.type === "status_change" || message.type === "heartbeat" || message.type === "metrics") {
        setInstances((prev) => {
          const index = prev.findIndex((inst) => inst.id === message.instanceId);
          if (index !== -1 && message.data.instance) {
            return prev.map((inst, i) => i === index ? message.data.instance : inst);
          }
          return prev;
        });
      }
    });
    return unsubscribe;
  }, [fetchInstances]);
  return { instances, loading, error, refetch: fetchInstances };
}
function formatLastSeen(timestamp) {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
function getStatusVariant(status) {
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
function InstanceCard({ instance, onDelete }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleDelete = async (e) => {
    e.preventDefault();
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteInstance(instance.id);
      setDeleteDialogOpen(false);
      toast.success(`Instance "${instance.name}" deleted successfully`);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Failed to delete instance:", error);
      toast.error("Failed to delete instance. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: instance.name }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "ID: ",
          instance.id
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Badge, { variant: getStatusVariant(instance.status), children: instance.status }),
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(
            DropdownMenuTrigger,
            {
              render: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0" }),
              children: /* @__PURE__ */ jsx(DotsThreeVerticalIcon, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsx(
              DropdownMenuItem,
              {
                onSelect: (e) => {
                  e.preventDefault();
                  navigate({ to: "/instances/$id", params: { id: instance.id } });
                },
                children: "View Details"
              }
            ),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(
              DropdownMenuItem,
              {
                variant: "destructive",
                onClick: () => {
                  setDeleteDialogOpen(true);
                },
                children: [
                  /* @__PURE__ */ jsx(TrashIcon, { className: "size-4 mr-2" }),
                  "Delete Instance"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
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
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            onClick: handleDelete,
            disabled: isDeleting,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            children: isDeleting ? "Deleting..." : "Delete"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Last seen:" }),
          /* @__PURE__ */ jsx("span", { children: formatLastSeen(instance.lastSeen) })
        ] }),
        instance.enrolledAt && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Enrolled:" }),
          /* @__PURE__ */ jsx("span", { children: new Date(instance.enrolledAt).toLocaleDateString() })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/instances/$id", params: { id: instance.id }, children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full", children: "View Details" }) }) })
    ] })
  ] });
}
function Dashboard() {
  const {
    instances,
    loading,
    error,
    refetch
  } = useInstances();
  const stats = {
    total: instances.length,
    online: instances.filter((i) => i.status === "online").length,
    offline: instances.filter((i) => i.status === "offline").length,
    error: instances.filter((i) => i.status === "error").length
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto p-4", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: "Loading instances..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-destructive", children: [
      "Error: ",
      error.message
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto p-4 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-medium mb-2", children: "Dashboard" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Monitor all Home Assistant instances" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs", children: "Total Instances" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-medium", children: stats.total }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs", children: "Online" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-medium text-primary", children: stats.online }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs", children: "Offline" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-medium", children: stats.offline }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-xs", children: "Error" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-medium text-destructive", children: stats.error }) })
      ] })
    ] }),
    instances.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-8 text-center text-muted-foreground", children: "No instances enrolled yet" }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: instances.map((instance) => /* @__PURE__ */ jsx(InstanceCard, { instance, onDelete: refetch }, instance.id)) })
  ] });
}
export {
  Dashboard as component
};
