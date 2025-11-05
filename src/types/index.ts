export type AssetStatus = "verified" | "pending" | "flagged" | "retired";

export type VerificationStatus = "passed" | "failed" | "in-progress";

export type RiskRating = "low" | "medium" | "high";

export interface VerificationRecord {
  id: string;
  assetId: string;
  date: string;
  status: VerificationStatus;
  performedById: string;
  notes: string;
  issues?: string[];
  evidence?: string[];
}

export interface Asset {
  id: string;
  name: string;
  assetTag: string;
  category: string;
  ownerId: string;
  locationId: string;
  status: AssetStatus;
  lastVerified: string;
  nextDue: string;
  riskRating: RiskRating;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  costCenter: string;
  tags: string[];
  verifications: VerificationRecord[];
}

export interface Person {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatarColor: string;
  certifications: string[];
  workload: {
    pending: number;
    completed: number;
    slaRisk: number;
  };
}

export interface Location {
  id: string;
  name: string;
  code: string;
  region: string;
  address: string;
  contactId: string;
  assetIds: string[];
  occupancy: number;
}

export type ActivityStatus = "info" | "warning" | "critical";

export interface ActivityLog {
  id: string;
  type: "verification" | "asset" | "incident";
  title: string;
  description: string;
  assetId?: string;
  personId?: string;
  createdAt: string;
  status: ActivityStatus;
}

export type TaskStatus = "scheduled" | "in-progress" | "completed" | "overdue";

export type TaskPriority = "low" | "medium" | "high";

export interface VerificationTask {
  id: string;
  assetId: string;
  dueDate: string;
  assignedToId: string;
  status: TaskStatus;
  priority: TaskPriority;
  checklist: string[];
}

export interface AssetStoreState {
  assets: Asset[];
  people: Person[];
  locations: Location[];
  activities: ActivityLog[];
  tasks: VerificationTask[];
}

export type AssetStoreAction =
  | { type: "ADD_ASSET"; payload: Asset }
  | { type: "UPDATE_ASSET"; payload: Asset }
  | {
      type: "ADD_VERIFICATION";
      payload: { assetId: string; verification: VerificationRecord };
    }
  | { type: "ADD_ACTIVITY"; payload: ActivityLog }
  | {
      type: "UPDATE_TASK_STATUS";
      payload: { taskId: string; status: TaskStatus };
    }
  | { type: "ADD_TASK"; payload: VerificationTask };

export interface AssetStoreContextValue extends AssetStoreState {
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  addVerification: (assetId: string, verification: VerificationRecord) => void;
  addActivity: (activity: ActivityLog) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addTask: (task: VerificationTask) => void;
  isHydrated: boolean;
}
