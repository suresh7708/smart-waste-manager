import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, PlayCircle, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/waste/app-shell";
import { ConditionBadge, PriorityBadge, StatusBadge } from "@/components/waste/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SAMPLE_PHOTOS, isOverdue, useWasteStore } from "@/lib/waste-store";

export const Route = createFileRoute("/worker")({
  head: () => ({
    meta: [
      { title: "Worker tasks | AI Smart Waste Complaint System" },
      {
        name: "description",
        content:
          "Collection staff view assigned waste tasks with location and photo, start work and upload completion proof.",
      },
      { property: "og:title", content: "Worker tasks | AI Smart Waste Complaint System" },
      {
        property: "og:description",
        content: "Assigned tasks, deadlines and completion-proof upload for collection workers.",
      },
    ],
  }),
  component: WorkerView,
});

const ME = "W-02"; // demo worker: Anita Devi

function timeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const h = Math.round(Math.abs(diff) / 3600_000);
  return diff >= 0 ? `${h}h left` : `${h}h overdue`;
}

function WorkerView() {
  const { complaints, workers, startWork, submitProof } = useWasteStore();
  const me = workers.find((w) => w.id === ME)!;

  const myTasks = complaints.filter(
    (c) => c.assignedTo === ME || (!c.assignedTo && c.status === "Pending" && false),
  );
  const active = myTasks.filter((c) => c.status === "Assigned" || c.status === "In Progress");
  const done = myTasks.filter((c) => c.status === "Completed" || c.status === "Verified");

  return (
    <AppShell
      title={`Welcome, ${me.name}`}
      subtitle={`${me.zone} · assigned tasks with full complaint context`}
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active tasks" value={active.length} />
        <StatCard label="Completed (all time)" value={me.completed} />
        <StatCard label="Avg. resolution" value={`${me.avgHours} h`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Active tasks
          </h2>
          {active.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing assigned right now. Ask the admin to assign a complaint from the dashboard.
            </p>
          )}
          {active.map((c) => (
            <TaskCard
              key={c.id}
              complaintId={c.id}
              onStart={() => {
                startWork(c.id);
                toast.success(`${c.id} marked In Progress`);
              }}
              onProof={(photo) => {
                submitProof(c.id, photo);
                toast.success(`${c.id} submitted for verification`);
              }}
            />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Awaiting verification & history
          </h2>
          {done.length === 0 && (
            <p className="text-sm text-muted-foreground">No submitted work yet.</p>
          )}
          {done.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex gap-3 p-4">
                <img
                  src={c.afterPhoto ?? c.beforePhoto}
                  alt={`Completion proof for ${c.id}`}
                  loading="lazy"
                  className="size-16 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.id}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.location} · {c.condition}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TaskCard({
  complaintId,
  onStart,
  onProof,
}: {
  complaintId: string;
  onStart: () => void;
  onProof: (photo: string) => void;
}) {
  const { complaints } = useWasteStore();
  const c = complaints.find((x) => x.id === complaintId)!;
  const fileRef = useRef<HTMLInputElement>(null);
  const [proof, setProof] = useState<string | null>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProof(URL.createObjectURL(file));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {c.id}
          <StatusBadge status={c.status} />
          <PriorityBadge priority={c.priority} />
          <span
            className={`ml-auto flex items-center gap-1 text-xs ${
              isOverdue(c) ? "font-medium text-destructive" : "text-muted-foreground"
            }`}
          >
            <Clock className="size-3" />
            {timeLeft(c.deadline)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <img
            src={c.beforePhoto}
            alt={`Reported waste at ${c.location}`}
            loading="lazy"
            className="size-24 rounded-lg object-cover"
          />
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-1 text-sm font-medium">
              <MapPin className="size-3.5 text-primary" />
              {c.location}
            </p>
            <ConditionBadge condition={c.condition} />
            <p className="text-sm text-muted-foreground">{c.description}</p>
          </div>
        </div>

        {c.reworkNote && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            Returned for rework: {c.reworkNote}
          </p>
        )}

        {c.status === "Assigned" ? (
          <Button onClick={onStart} className="w-full">
            <PlayCircle className="size-4" />
            Start work
          </Button>
        ) : (
          <div className="space-y-3">
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-center hover:border-primary/50"
            >
              {proof ? (
                <img
                  src={proof}
                  alt="Completion proof preview"
                  loading="lazy"
                  className="max-h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <Upload className="size-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Upload after-collection photo</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setProof(SAMPLE_PHOTOS.clean)}
              >
                Use sample cleaned-bin photo
              </button>
            </div>
            <Button
              className="w-full"
              disabled={!proof}
              onClick={() => proof && onProof(proof)}
            >
              <CheckCircle2 className="size-4" />
              Submit completion proof
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
