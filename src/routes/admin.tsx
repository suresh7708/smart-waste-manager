import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  ListChecks,
  MapPin,
  Search,
  TrendingDown,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/waste/app-shell";
import { ConditionBadge, PriorityBadge, StatusBadge } from "@/components/waste/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  HOTSPOTS,
  LIFETIME_STATS,
  isOverdue,
  useWasteStore,
  type Complaint,
} from "@/lib/waste-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | AI Smart Waste Complaint System" },
      {
        name: "description",
        content:
          "Review the AI-prioritised complaint queue, assign workers, verify completion photos and track waste hotspots.",
      },
      { property: "og:title", content: "Admin dashboard | AI Smart Waste Complaint System" },
      {
        property: "og:description",
        content:
          "Complaint queue, worker assignment, completion verification and hotspot analytics in one dashboard.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { complaints, workers, workerName, assignWorker, verify, requestRework } = useWasteStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Complaint | null>(null);
  const [reworkNote, setReworkNote] = useState("");

  const filtered = useMemo(
    () =>
      complaints.filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
        if (query) {
          const q = query.toLowerCase();
          if (
            !c.id.toLowerCase().includes(q) &&
            !c.location.toLowerCase().includes(q) &&
            !c.description.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [complaints, statusFilter, priorityFilter, query],
  );

  const awaitingVerification = complaints.filter((c) => c.status === "Completed");
  const maxHotspot = Math.max(...HOTSPOTS.map((h) => h.complaints));

  const stats = [
    { label: "Total", value: LIFETIME_STATS.total, icon: ClipboardList, tone: "text-primary" },
    { label: "Pending", value: LIFETIME_STATS.pending, icon: Clock, tone: "text-muted-foreground" },
    {
      label: "In Progress",
      value: LIFETIME_STATS.inProgress,
      icon: ListChecks,
      tone: "text-warning-foreground",
    },
    {
      label: "Completed",
      value: LIFETIME_STATS.completed,
      icon: CheckCircle2,
      tone: "text-success",
    },
    { label: "Overdue", value: LIFETIME_STATS.overdue, icon: AlertTriangle, tone: "text-destructive" },
  ];

  return (
    <AppShell
      title="Admin Dashboard"
      subtitle="Monitor complaints, assign workers, verify collection and spot recurring problem areas."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {s.label}
                </p>
                <s.icon className={cn("size-4", s.tone)} />
              </div>
              <p className="mt-2 text-3xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {awaitingVerification.length > 0 && (
        <Card className="mb-8 border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">
              Completion verification ({awaitingVerification.length} awaiting review)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {awaitingVerification.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{c.id}</span>
                  <span className="text-sm text-muted-foreground">{c.location}</span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <figure>
                    <img
                      src={c.beforePhoto}
                      alt={`Before collection at ${c.location}`}
                      loading="lazy"
                      className="h-28 w-full rounded-lg object-cover"
                    />
                    <figcaption className="mt-1 text-xs text-muted-foreground">Before</figcaption>
                  </figure>
                  <figure>
                    <img
                      src={c.afterPhoto}
                      alt={`After collection at ${c.location}`}
                      loading="lazy"
                      className="h-28 w-full rounded-lg object-cover"
                    />
                    <figcaption className="mt-1 text-xs text-muted-foreground">After</figcaption>
                  </figure>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Submitted by {workerName(c.assignedTo)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      verify(c.id);
                      toast.success(`${c.id} verified and closed`);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReviewTarget(c);
                      setReworkNote("");
                    }}
                  >
                    Send for rework
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader className="gap-4">
          <CardTitle className="text-base">Complaint management queue</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ID, location or description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Pending", "Assigned", "In Progress", "Completed", "Verified"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {["High", "Medium", "Low"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No complaints match these filters.</p>
          )}
          {filtered.map((c) => {
            const overdue = isOverdue(c);
            return (
              <div
                key={c.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center",
                  overdue ? "border-destructive/40 bg-destructive/5" : "border-border",
                )}
              >
                <img
                  src={c.beforePhoto}
                  alt={`Reported waste at ${c.location}`}
                  loading="lazy"
                  className="h-20 w-full rounded-lg object-cover sm:size-20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.id}</span>
                    <PriorityBadge priority={c.priority} />
                    <ConditionBadge condition={c.condition} />
                    <StatusBadge status={c.status} />
                    {overdue && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                        <AlertTriangle className="size-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {c.location}
                    </span>
                    <span>{c.wasteType}</span>
                    <span>AI confidence {Math.round(c.confidence * 100)}%</span>
                    <span>Deadline {new Date(c.deadline).toLocaleString()}</span>
                  </p>
                  <p className="mt-1 truncate text-sm">{c.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reported by {c.reportedBy} · Worker: {workerName(c.assignedTo)}
                  </p>
                </div>
                <div className="shrink-0">
                  {c.status === "Pending" ? (
                    <Button size="sm" onClick={() => setAssignTarget(c)}>
                      <UserPlus className="size-4" />
                      Assign worker
                    </Button>
                  ) : c.status === "Completed" ? (
                    <Button size="sm" variant="outline" onClick={() => verify(c.id)}>
                      Verify
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setAssignTarget(c)}>
                      Reassign
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary" />
              Smart Waste Hotspot Detection
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Complaint history by location reveals repeat-issue areas and where preventive action
              pays off.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {HOTSPOTS.map((h) => (
              <div key={h.location}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{h.location}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span>{h.complaints} complaints</span>
                    <span>·</span>
                    <span>avg {h.avgResolutionHours}h</span>
                    {h.trend === "up" ? (
                      <TrendingUp className="size-3.5 text-destructive" />
                    ) : h.trend === "down" ? (
                      <TrendingDown className="size-3.5 text-success" />
                    ) : null}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      h.complaints > 30
                        ? "bg-destructive"
                        : h.complaints > 12
                          ? "bg-warning"
                          : "bg-success",
                    )}
                    style={{ width: `${(h.complaints / maxHotspot) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Worker performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workers.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
              >
                <div>
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.zone}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">{w.assigned}</span> assigned ·{" "}
                    <span className="font-semibold text-foreground">{w.completed}</span> done
                  </p>
                  <p>avg {w.avgHours}h</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign worker — {assignTarget?.id}</DialogTitle>
            <DialogDescription>
              {assignTarget?.location} · {assignTarget?.condition} · {assignTarget?.priority}{" "}
              priority
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {workers.map((w) => (
              <button
                key={w.id}
                disabled={!w.available}
                onClick={() => {
                  if (!assignTarget) return;
                  assignWorker(assignTarget.id, w.id);
                  toast.success(`${assignTarget.id} assigned to ${w.name}`);
                  setAssignTarget(null);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.zone}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{w.assigned} active tasks</p>
                  <p className={w.available ? "text-success" : "text-destructive"}>
                    {w.available ? "Available" : "On leave"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reviewTarget} onOpenChange={(o) => !o && setReviewTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send back for rework — {reviewTarget?.id}</DialogTitle>
            <DialogDescription>
              The worker will see this note and the task returns to In Progress.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            placeholder="e.g. Area around the bin is still littered."
            value={reworkNote}
            onChange={(e) => setReworkNote(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!reviewTarget) return;
              requestRework(reviewTarget.id, reworkNote || "Completion evidence not acceptable.");
              toast.info(`${reviewTarget.id} returned for rework`);
              setReviewTarget(null);
            }}
          >
            Confirm rework request
          </Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
