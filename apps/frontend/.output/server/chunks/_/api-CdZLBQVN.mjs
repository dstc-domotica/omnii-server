import { jsx } from "react/jsx-runtime";
import { c as cn } from "./router-CLITfZHp.mjs";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
function Card({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      "data-size": size,
      className: cn("ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-none py-4 text-xs/relaxed ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-2 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none group/card flex flex-col", className),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "gap-1 rounded-none px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("text-sm font-medium group-data-[size=sm]/card:text-sm", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-4 group-data-[size=sm]/card:px-3", className),
      ...props
    }
  );
}
const badgeVariants = cva(
  "h-5 gap-1 rounded-none border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant = "default",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps(
      {
        className: cn(badgeVariants({ className, variant }))
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant
    }
  });
}
const API_BASE_URL = "http://localhost:3001";
async function fetchAPI(endpoint, options) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}
async function getInstances() {
  return fetchAPI("/instances");
}
async function getInstance(id) {
  return fetchAPI(`/instances/${id}`);
}
async function getInstanceMetrics(id, limit = 100) {
  return fetchAPI(`/instances/${id}/metrics?limit=${limit}`);
}
async function getInstanceHeartbeats(id, limit = 100) {
  return fetchAPI(`/instances/${id}/heartbeats?limit=${limit}`);
}
async function sendCommand(instanceId, command, payload) {
  return fetchAPI(`/instances/${instanceId}/command`, {
    method: "POST",
    body: JSON.stringify({ command, payload: {} })
  });
}
async function getEnrollmentCodes(all = true) {
  return fetchAPI(`/enrollment-codes${all ? "?all=true" : ""}`);
}
async function createEnrollmentCode(expiresInHours = 24) {
  return fetchAPI("/enrollment-codes", {
    method: "POST",
    body: JSON.stringify({ expiresInHours })
  });
}
async function getSettings() {
  return fetchAPI("/settings");
}
async function updateSettings(settings) {
  return fetchAPI("/settings", {
    method: "PUT",
    body: JSON.stringify(settings)
  });
}
async function deleteInstance(id) {
  return fetchAPI(`/instances/${id}`, {
    method: "DELETE"
  });
}
async function deactivateEnrollmentCode(id) {
  return fetchAPI(`/enrollment-codes/${id}/deactivate`, {
    method: "POST"
  });
}
export {
  Badge as B,
  Card as C,
  CardContent as a,
  CardHeader as b,
  CardTitle as c,
  getEnrollmentCodes as d,
  createEnrollmentCode as e,
  deactivateEnrollmentCode as f,
  getSettings as g,
  getInstances as h,
  deleteInstance as i,
  getInstance as j,
  getInstanceMetrics as k,
  getInstanceHeartbeats as l,
  sendCommand as s,
  updateSettings as u
};
