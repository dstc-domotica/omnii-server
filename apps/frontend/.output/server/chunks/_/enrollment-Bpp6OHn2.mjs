import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { g as getSettings, d as getEnrollmentCodes, C as Card, a as CardContent, b as CardHeader, c as CardTitle, B as Badge, e as createEnrollmentCode, f as deactivateEnrollmentCode } from "./api-CdZLBQVN.mjs";
import { B as Button, S as Separator } from "./router-CLITfZHp.mjs";
import { L as Label, I as Input } from "./label-EgOV3Hn-.mjs";
import { toast } from "sonner";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-BcDv3iVx.mjs";
import "@base-ui/react/merge-props";
import "@base-ui/react/use-render";
import "class-variance-authority";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@base-ui/react/button";
import "clsx";
import "tailwind-merge";
import "@base-ui/react/separator";
import "@base-ui/react/input";
import "@base-ui/react/alert-dialog";
function EnrollmentPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deactivating, setDeactivating] = useState(null);
  const [serverHost, setServerHost] = useState("");
  useEffect(() => {
    fetchCodes();
    fetchServerHost();
  }, []);
  async function fetchServerHost() {
    try {
      const settings = await getSettings();
      if (settings.serverHost) {
        setServerHost(settings.serverHost);
      }
    } catch (err) {
      console.error("Failed to fetch server host:", err);
    }
  }
  useEffect(() => {
    fetchCodes();
  }, []);
  async function fetchCodes() {
    try {
      setLoading(true);
      setError(null);
      const data = await getEnrollmentCodes(true);
      setCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch enrollment codes"));
    } finally {
      setLoading(false);
    }
  }
  async function handleCreateCode() {
    try {
      setCreating(true);
      setError(null);
      const hours = parseInt(expiresInHours, 10) || 24;
      const code = await createEnrollmentCode(hours);
      setNewCode(code.code);
      await fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create enrollment code"));
    } finally {
      setCreating(false);
    }
  }
  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
  function isExpired(code) {
    return Date.now() > code.expiresAt;
  }
  function isUsed(code) {
    return code.usedAt !== null;
  }
  function isDeactivated(code) {
    return code.deactivatedAt !== null;
  }
  function getServerUrl() {
    if (serverHost) {
      const port = window.location.port || "3001";
      return `http://${serverHost}:${port}`;
    }
    const origin = window.location.origin;
    return origin.replace(/:\d+$/, ":3001");
  }
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }
  async function handleCopy(field, value) {
    await copyToClipboard(value);
    toast.success(`${field === "code" ? "Enrollment code" : field} copied to clipboard`);
  }
  const filteredCodes = codes.filter((code) => {
    if (filter === "active") return !isUsed(code) && !isExpired(code) && !isDeactivated(code);
    if (filter === "used") return isUsed(code);
    if (filter === "expired") return isExpired(code) && !isUsed(code) && !isDeactivated(code);
    if (filter === "deactivated") return isDeactivated(code);
    return true;
  });
  const activeCount = codes.filter((c) => !isUsed(c) && !isExpired(c) && !isDeactivated(c)).length;
  const usedCount = codes.filter((c) => isUsed(c)).length;
  const expiredCount = codes.filter((c) => isExpired(c) && !isUsed(c) && !isDeactivated(c)).length;
  const deactivatedCount = codes.filter((c) => isDeactivated(c)).length;
  async function handleDeactivate(codeId) {
    try {
      setDeactivating(codeId);
      await deactivateEnrollmentCode(codeId);
      toast.success("Enrollment code deactivated");
      await fetchCodes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate enrollment code");
    } finally {
      setDeactivating(null);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto p-4", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: "Loading enrollment codes..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto p-4 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-medium mb-2", children: "Enrollment Codes" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Generate and manage enrollment codes for Home Assistant instances" })
    ] }),
    error && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-4 text-destructive", children: error.message }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Generate New Code" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "expires", children: "Expires In (hours)" }),
          /* @__PURE__ */ jsx(Input, { id: "expires", type: "number", value: expiresInHours, onChange: (e) => setExpiresInHours(e.target.value), min: "1", max: "168" })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: handleCreateCode, disabled: creating, children: creating ? "Creating..." : "Generate Code" }),
        newCode && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-muted rounded border", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium mb-2", children: "New Enrollment Code:" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-mono font-bold", children: newCode }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Share this code with the Home Assistant instance to enroll" })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Add-on Configuration" }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Copy these values into your Home Assistant add-on configuration:" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs font-medium", children: "server_url" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Input, { readOnly: true, value: getServerUrl(), className: "font-mono text-sm" }),
                  /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => handleCopy("server_url", getServerUrl()), children: "Copy" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "The full URL of your Omnii server (include protocol and port)" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs font-medium", children: "enrollment_code" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Input, { readOnly: true, value: newCode, className: "font-mono text-sm font-bold" }),
                  /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => handleCopy("enrollment_code", newCode), children: "Copy" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "The 6-digit enrollment code generated above" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Enrollment Codes" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: filter === "all" ? "default" : "outline", size: "sm", onClick: () => setFilter("all"), className: "text-xs", children: [
            "All (",
            codes.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: filter === "active" ? "default" : "outline", size: "sm", onClick: () => setFilter("active"), className: "text-xs", children: [
            "Active (",
            activeCount,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: filter === "used" ? "default" : "outline", size: "sm", onClick: () => setFilter("used"), className: "text-xs", children: [
            "Used (",
            usedCount,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: filter === "expired" ? "default" : "outline", size: "sm", onClick: () => setFilter("expired"), className: "text-xs", children: [
            "Expired (",
            expiredCount,
            ")"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: filter === "deactivated" ? "default" : "outline", size: "sm", onClick: () => setFilter("deactivated"), className: "text-xs", children: [
            "Deactivated (",
            deactivatedCount,
            ")"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: filteredCodes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center text-muted-foreground py-8", children: codes.length === 0 ? "No enrollment codes" : `No ${filter} enrollment codes` }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: filteredCodes.map((code) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-lg font-mono font-bold", children: code.code }),
              isUsed(code) && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Used" }),
              isDeactivated(code) && /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "Deactivated" }),
              isExpired(code) && !isUsed(code) && !isDeactivated(code) && /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "Expired" }),
              !isExpired(code) && !isUsed(code) && !isDeactivated(code) && /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Active" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
              "Created: ",
              formatTimestamp(code.createdAt),
              " | Expires: ",
              formatTimestamp(code.expiresAt)
            ] }),
            code.usedAt && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Used: ",
              formatTimestamp(code.usedAt)
            ] }),
            code.deactivatedAt && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Deactivated: ",
              formatTimestamp(code.deactivatedAt)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            !isUsed(code) && !isDeactivated(code) && !isExpired(code) && /* @__PURE__ */ jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "destructive", disabled: deactivating === code.id, children: deactivating === code.id ? "Deactivating..." : "Deactivate" }) }),
              /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
                /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Deactivate Enrollment Code" }),
                  /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
                    "Are you sure you want to deactivate code ",
                    /* @__PURE__ */ jsx("strong", { children: code.code }),
                    "? This will make it unavailable for enrollment immediately."
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
                  /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => handleDeactivate(code.id), className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Deactivate" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => handleCopy("code", code.code), children: "Copy" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Separator, {})
      ] }, code.id)) }) })
    ] })
  ] });
}
export {
  EnrollmentPage as component
};
