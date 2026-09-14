import { createFileRoute } from "@tanstack/react-router";
import { Camera, Loader2, MapPin, Sparkles, Star, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/waste/app-shell";
import { ConditionBadge, PriorityBadge, StatusBadge } from "@/components/waste/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  analyseImage,
  deadlineHoursForPriority,
  LOCATIONS,
  SAMPLE_PHOTOS,
  STATUS_FLOW,
  useWasteStore,
  type AiResult,
} from "@/lib/waste-store";

export const Route = createFileRoute("/user")({
  head: () => ({
    meta: [
      { title: "Report waste | AI Smart Waste Complaint System" },
      {
        name: "description",
        content:
          "Submit a waste complaint with a photo, get instant AI condition and priority analysis, and track progress to resolution.",
      },
      { property: "og:title", content: "Report waste | AI Smart Waste Complaint System" },
      {
        property: "og:description",
        content: "Photo-based waste reporting with AI analysis and live complaint tracking.",
      },
    ],
  }),
  component: UserPortal,
});

function UserPortal() {
  const { complaints, addComplaint, rate, workerName } = useWasteStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);

  const mine = complaints.filter(
    (c) => c.reportedBy.startsWith("You") || c.reportedBy.startsWith("Priya"),
  );

  const runAnalysis = (seed: string) => {
    setAnalysing(true);
    setAi(null);
    setTimeout(() => {
      setAi(analyseImage(seed));
      setAnalysing(false);
    }, 1400);
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    runAnalysis(`${file.name}${file.size}`);
  };

  const useSample = (src: string, seed: string) => {
    setPhoto(src);
    runAnalysis(seed);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!photo || !location || !ai) {
      toast.error("Add a photo, pick a location and wait for the AI analysis.");
      return;
    }
    const created = addComplaint({ location, description, photo, ai });
    toast.success(`Complaint ${created.id} submitted`, {
      description: `${created.priority} priority · deadline in ${deadlineHoursForPriority(created.priority)}h`,
    });
    setPhoto(null);
    setAi(null);
    setDescription("");
    setLocation("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <AppShell
      title="User Portal"
      subtitle="Report a waste problem with a photo and follow it through to verification."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="size-4 text-primary" />
              New complaint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={submit}>
              <div className="space-y-2">
                <Label>Waste photo</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center transition-colors hover:border-primary/50"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt="Selected waste"
                      loading="lazy"
                      className="max-h-56 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <Upload className="size-6 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">Upload or capture a photo</p>
                      <p className="text-xs text-muted-foreground">JPG or PNG, max 5 MB</p>
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
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">No photo handy?</span>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => useSample(SAMPLE_PHOTOS.overflowing, "overflow-sample")}
                  >
                    Use overflowing bin sample
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => useSample(SAMPLE_PHOTOS.litter, "litter-sample-2")}
                  >
                    Use litter sample
                  </button>
                </div>
              </div>

              {(analysing || ai) && (
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                  {analysing ? (
                    <p className="flex items-center gap-2 text-sm text-primary">
                      <Loader2 className="size-4 animate-spin" />
                      AI is analysing the image…
                    </p>
                  ) : (
                    ai && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Sparkles className="size-4" />
                          AI analysis complete
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <ConditionBadge condition={ai.condition} />
                          <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs">
                            {ai.wasteType}
                          </span>
                          <PriorityBadge priority={ai.priority} />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(ai.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Suggested deadline: {deadlineHoursForPriority(ai.priority)} hours from
                          submission. Admin can override before assignment.
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Describe the problem — e.g. bin overflowing since morning."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit complaint
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">My complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mine.length === 0 && (
              <p className="text-sm text-muted-foreground">No complaints submitted yet.</p>
            )}
            {mine.map((c) => {
              const stepIndex = STATUS_FLOW.indexOf(c.status);
              return (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <img
                      src={c.beforePhoto}
                      alt={`Waste reported at ${c.location}`}
                      loading="lazy"
                      className="size-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{c.id}</span>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {c.location} · {c.condition} · worker: {workerName(c.assignedTo)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1">
                    {STATUS_FLOW.map((s, i) => (
                      <div key={s} className="flex-1">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            i <= stepIndex ? "bg-primary" : "bg-muted",
                          )}
                        />
                        <p
                          className={cn(
                            "mt-1 text-[10px] whitespace-nowrap",
                            i <= stepIndex ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {s}
                        </p>
                      </div>
                    ))}
                  </div>

                  {c.status === "Verified" && (
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">Rate the resolution:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            rate(c.id, n);
                            toast.success("Thanks for the feedback!");
                          }}
                          aria-label={`Rate ${n} stars`}
                        >
                          <Star
                            className={cn(
                              "size-4",
                              (c.rating ?? 0) >= n
                                ? "fill-warning text-warning"
                                : "text-muted-foreground",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
