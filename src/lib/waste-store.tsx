import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import overflowingImg from "@/assets/waste-overflowing.jpg";
import partialImg from "@/assets/waste-partial.jpg";
import cleanImg from "@/assets/waste-clean.jpg";
import litterImg from "@/assets/waste-litter.jpg";

export type Role = "user" | "worker" | "admin";

export type Status = "Pending" | "Assigned" | "In Progress" | "Completed" | "Verified";
export type Priority = "High" | "Medium" | "Low";
export type Condition = "Overflowing" | "Partially Filled" | "Normal";

export const STATUS_FLOW: Status[] = [
  "Pending",
  "Assigned",
  "In Progress",
  "Completed",
  "Verified",
];

export const LOCATIONS = [
  "Canteen",
  "Hostel Block A",
  "Hostel Block B",
  "Library",
  "Academic Block",
  "Parking Area",
  "Sports Ground",
] as const;

export type Worker = {
  id: string;
  name: string;
  zone: string;
  available: boolean;
  assigned: number;
  completed: number;
  avgHours: number;
};

export type Complaint = {
  id: string;
  location: string;
  description: string;
  condition: Condition;
  wasteType: string;
  priority: Priority;
  confidence: number;
  status: Status;
  reportedBy: string;
  createdAt: string;
  deadline: string;
  assignedTo?: string;
  beforePhoto: string;
  afterPhoto?: string;
  rating?: number;
  reworkNote?: string;
};

export type Hotspot = {
  location: string;
  complaints: number;
  avgResolutionHours: number;
  trend: "up" | "down" | "flat";
};

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

export const WORKERS: Worker[] = [
  { id: "W-01", name: "Ramesh Kumar", zone: "Canteen & Mess", available: true, assigned: 4, completed: 61, avgHours: 3.2 },
  { id: "W-02", name: "Anita Devi", zone: "Hostel Blocks", available: true, assigned: 2, completed: 48, avgHours: 2.6 },
  { id: "W-03", name: "Suresh Patel", zone: "Academic & Library", available: true, assigned: 3, completed: 55, avgHours: 4.1 },
  { id: "W-04", name: "Farhan Ali", zone: "Grounds & Parking", available: false, assigned: 5, completed: 39, avgHours: 3.8 },
];

export const HOTSPOTS: Hotspot[] = [
  { location: "Canteen", complaints: 45, avgResolutionHours: 3.4, trend: "up" },
  { location: "Hostel Block A", complaints: 32, avgResolutionHours: 4.8, trend: "up" },
  { location: "Academic Block", complaints: 21, avgResolutionHours: 5.2, trend: "flat" },
  { location: "Parking Area", complaints: 14, avgResolutionHours: 6.1, trend: "down" },
  { location: "Hostel Block B", complaints: 13, avgResolutionHours: 3.9, trend: "flat" },
  { location: "Library", complaints: 3, avgResolutionHours: 2.1, trend: "down" },
];

// Headline figures from the project overview (whole-year records).
export const LIFETIME_STATS = {
  total: 128,
  pending: 14,
  inProgress: 22,
  completed: 76,
  overdue: 6,
};

const SEED: Complaint[] = [
  {
    id: "WST1025",
    location: "Hostel Block A",
    description: "Bin near the stairwell has been overflowing since yesterday evening.",
    condition: "Overflowing",
    wasteType: "Mixed waste",
    priority: "High",
    confidence: 0.94,
    status: "Pending",
    reportedBy: "Priya S. (Resident)",
    createdAt: hoursFromNow(-3),
    deadline: hoursFromNow(1),
    beforePhoto: overflowingImg,
  },
  {
    id: "WST1026",
    location: "Canteen",
    description: "Food waste spilling out of the main bin beside the counter.",
    condition: "Overflowing",
    wasteType: "Food waste",
    priority: "High",
    confidence: 0.91,
    status: "Pending",
    reportedBy: "Arjun M. (Student)",
    createdAt: hoursFromNow(-8),
    deadline: hoursFromNow(-2),
    beforePhoto: overflowingImg,
  },
  {
    id: "WST1027",
    location: "Library",
    description: "Paper and bottles scattered near the entrance bin.",
    condition: "Partially Filled",
    wasteType: "Paper / Plastic",
    priority: "Medium",
    confidence: 0.82,
    status: "Assigned",
    reportedBy: "Neha R. (Student)",
    createdAt: hoursFromNow(-6),
    deadline: hoursFromNow(4),
    assignedTo: "W-03",
    beforePhoto: litterImg,
  },
  {
    id: "WST1028",
    location: "Hostel Block B",
    description: "Corridor bin half full, wrappers on the floor around it.",
    condition: "Partially Filled",
    wasteType: "Plastic",
    priority: "Medium",
    confidence: 0.78,
    status: "In Progress",
    reportedBy: "Karan T. (Resident)",
    createdAt: hoursFromNow(-5),
    deadline: hoursFromNow(3),
    assignedTo: "W-02",
    beforePhoto: partialImg,
  },
  {
    id: "WST1029",
    location: "Academic Block",
    description: "Dustbin outside lab 204 needs clearing before evening classes.",
    condition: "Normal",
    wasteType: "Paper",
    priority: "Low",
    confidence: 0.71,
    status: "Completed",
    reportedBy: "Dr. Iyer (Faculty)",
    createdAt: hoursFromNow(-26),
    deadline: hoursFromNow(-14),
    assignedTo: "W-03",
    beforePhoto: partialImg,
    afterPhoto: cleanImg,
  },
  {
    id: "WST1030",
    location: "Canteen",
    description: "Waste pile beside the service entrance after lunch rush.",
    condition: "Overflowing",
    wasteType: "Food waste",
    priority: "High",
    confidence: 0.96,
    status: "Completed",
    reportedBy: "Priya S. (Resident)",
    createdAt: hoursFromNow(-30),
    deadline: hoursFromNow(-24),
    assignedTo: "W-01",
    beforePhoto: overflowingImg,
    afterPhoto: cleanImg,
  },
  {
    id: "WST1031",
    location: "Parking Area",
    description: "Litter blown around the bins near gate 2.",
    condition: "Partially Filled",
    wasteType: "Mixed waste",
    priority: "Medium",
    confidence: 0.75,
    status: "Verified",
    reportedBy: "Security Desk",
    createdAt: hoursFromNow(-52),
    deadline: hoursFromNow(-44),
    assignedTo: "W-04",
    beforePhoto: litterImg,
    afterPhoto: cleanImg,
    rating: 5,
  },
];

export const SAMPLE_PHOTOS = {
  overflowing: overflowingImg,
  partial: partialImg,
  clean: cleanImg,
  litter: litterImg,
};

export function priorityForCondition(condition: Condition): Priority {
  if (condition === "Overflowing") return "High";
  if (condition === "Partially Filled") return "Medium";
  return "Low";
}

export function deadlineHoursForPriority(priority: Priority) {
  return priority === "High" ? 4 : priority === "Medium" ? 12 : 24;
}

export function isOverdue(c: Complaint) {
  return (
    new Date(c.deadline).getTime() < Date.now() &&
    c.status !== "Completed" &&
    c.status !== "Verified"
  );
}

export type AiResult = {
  condition: Condition;
  wasteType: string;
  priority: Priority;
  confidence: number;
};

/** Simulated AI image analysis — deterministic from the file name/size. */
export function analyseImage(seed: string): AiResult {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 100000;
  const conditions: Condition[] = ["Overflowing", "Partially Filled", "Normal"];
  const types = ["Mixed waste", "Food waste", "Plastic", "Paper"];
  const condition = conditions[hash % 3]!;
  return {
    condition,
    wasteType: types[hash % 4]!,
    priority: priorityForCondition(condition),
    confidence: 0.72 + ((hash % 25) / 100),
  };
}

type Store = {
  role: Role | null;
  signIn: (role: Role) => void;
  signOut: () => void;
  complaints: Complaint[];
  workers: Worker[];
  workerName: (id?: string) => string;
  addComplaint: (input: {
    location: string;
    description: string;
    photo: string;
    ai: AiResult;
  }) => Complaint;
  assignWorker: (complaintId: string, workerId: string) => void;
  startWork: (complaintId: string) => void;
  submitProof: (complaintId: string, photo: string) => void;
  verify: (complaintId: string) => void;
  requestRework: (complaintId: string, note: string) => void;
  rate: (complaintId: string, rating: number) => void;
};

const StoreContext = createContext<Store | null>(null);

export function WasteStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(SEED);
  const [workers, setWorkers] = useState<Worker[]>(WORKERS);
  const [counter, setCounter] = useState(1032);

  type ComplaintPatch = { [K in keyof Complaint]?: Complaint[K] | undefined };
  const patch = useCallback((id: string, next: ComplaintPatch) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? ({ ...c, ...next } as Complaint) : c)));
  }, []);

  const value = useMemo<Store>(
    () => ({
      role,
      signIn: (r) => setRole(r),
      signOut: () => setRole(null),
      complaints,
      workers,
      workerName: (id) => workers.find((w) => w.id === id)?.name ?? "Unassigned",
      addComplaint: ({ location, description, photo, ai }) => {
        const id = `WST${counter}`;
        const complaint: Complaint = {
          id,
          location,
          description,
          condition: ai.condition,
          wasteType: ai.wasteType,
          priority: ai.priority,
          confidence: ai.confidence,
          status: "Pending",
          reportedBy: "You (Resident)",
          createdAt: new Date().toISOString(),
          deadline: hoursFromNow(deadlineHoursForPriority(ai.priority)),
          beforePhoto: photo,
        };
        setCounter((n) => n + 1);
        setComplaints((prev) => [complaint, ...prev]);
        return complaint;
      },
      assignWorker: (complaintId, workerId) => {
        patch(complaintId, { status: "Assigned", assignedTo: workerId, reworkNote: undefined });
        setWorkers((prev) =>
          prev.map((w) => (w.id === workerId ? { ...w, assigned: w.assigned + 1 } : w)),
        );
      },
      startWork: (complaintId) => patch(complaintId, { status: "In Progress" }),
      submitProof: (complaintId, photo) =>
        patch(complaintId, { status: "Completed", afterPhoto: photo }),
      verify: (complaintId) => {
        const c = complaints.find((x) => x.id === complaintId);
        patch(complaintId, { status: "Verified" });
        if (c?.assignedTo) {
          setWorkers((prev) =>
            prev.map((w) =>
              w.id === c.assignedTo
                ? { ...w, completed: w.completed + 1, assigned: Math.max(0, w.assigned - 1) }
                : w,
            ),
          );
        }
      },
      requestRework: (complaintId, note) =>
        patch(complaintId, { status: "In Progress", afterPhoto: undefined, reworkNote: note }),
      rate: (complaintId, rating) => patch(complaintId, { rating }),
    }),
    [role, complaints, workers, counter, patch],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useWasteStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useWasteStore must be used inside WasteStoreProvider");
  return ctx;
}
