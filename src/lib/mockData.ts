import {
  ActivityLog,
  Asset,
  AssetStatus,
  Location,
  Person,
  RiskRating,
  TaskPriority,
  TaskStatus,
  VerificationRecord,
  VerificationTask,
  VerificationStatus,
} from "@/types";

const today = new Date();

const formatDate = (date: Date) =>
  date.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0];

const daysFromToday = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const makeVerification = (
  id: string,
  assetId: string,
  daysFromNow: number,
  status: VerificationStatus,
  performedById: string,
  notes: string,
  issues?: string[]
): VerificationRecord => ({
  id,
  assetId,
  date: daysFromNow >= 0 ? daysFromToday(daysFromNow) : daysFromToday(daysFromNow),
  status,
  performedById,
  notes,
  issues,
});

const people: Person[] = [
  {
    id: "PER-001",
    name: "Nadia Patel",
    role: "Asset Compliance Lead",
    department: "IT Governance",
    email: "nadia.patel@example.com",
    phone: "+1 415-555-0198",
    avatarColor: "bg-rose-500",
    certifications: ["CISA", "ITIL v4"],
    workload: { pending: 6, completed: 42, slaRisk: 1 },
  },
  {
    id: "PER-002",
    name: "Marcus Lee",
    role: "Regional Auditor",
    department: "Infrastructure",
    email: "marcus.lee@example.com",
    phone: "+1 303-555-0109",
    avatarColor: "bg-blue-500",
    certifications: ["CCSP", "CISSP"],
    workload: { pending: 9, completed: 31, slaRisk: 3 },
  },
  {
    id: "PER-003",
    name: "Ivy Thompson",
    role: "Asset Custodian",
    department: "EU Operations",
    email: "ivy.thompson@example.com",
    phone: "+44 20 7946 0955",
    avatarColor: "bg-emerald-500",
    certifications: ["ISO 27001 Lead Auditor"],
    workload: { pending: 4, completed: 27, slaRisk: 0 },
  },
  {
    id: "PER-004",
    name: "Diego Fernandez",
    role: "Field Verification Specialist",
    department: "LATAM Support",
    email: "diego.fernandez@example.com",
    phone: "+55 11 3091-4456",
    avatarColor: "bg-amber-500",
    certifications: ["CompTIA Security+"],
    workload: { pending: 5, completed: 18, slaRisk: 2 },
  },
];

const locations: Location[] = [
  {
    id: "LOC-001",
    name: "San Francisco HQ",
    code: "SF-HQ",
    region: "North America",
    address: "525 Market Street, San Francisco, CA",
    contactId: "PER-001",
    assetIds: [],
    occupancy: 86,
  },
  {
    id: "LOC-002",
    name: "Denver DC",
    code: "DEN-DC",
    region: "North America",
    address: "1500 Curtis Street, Denver, CO",
    contactId: "PER-002",
    assetIds: [],
    occupancy: 63,
  },
  {
    id: "LOC-003",
    name: "London Campus",
    code: "LDN-OPS",
    region: "EMEA",
    address: "10 Upper Bank Street, London, UK",
    contactId: "PER-003",
    assetIds: [],
    occupancy: 74,
  },
  {
    id: "LOC-004",
    name: "São Paulo Hub",
    code: "SAO-HUB",
    region: "LATAM",
    address: "Av. Paulista, 2300, São Paulo, Brazil",
    contactId: "PER-004",
    assetIds: [],
    occupancy: 55,
  },
];

const assetFactory = (
  id: string,
  name: string,
  assetTag: string,
  category: string,
  ownerId: string,
  locationId: string,
  status: AssetStatus,
  lastVerified: string,
  nextDue: string,
  riskRating: RiskRating,
  serialNumber: string,
  purchaseDate: string,
  warrantyExpiry: string,
  costCenter: string,
  tags: string[],
  verifications: VerificationRecord[]
): Asset => ({
  id,
  name,
  assetTag,
  category,
  ownerId,
  locationId,
  status,
  lastVerified,
  nextDue,
  riskRating,
  serialNumber,
  purchaseDate,
  warrantyExpiry,
  costCenter,
  tags,
  verifications,
});

const assets: Asset[] = [
  assetFactory(
    "AST-1001",
    "MacBook Pro 16\"",
    "IT-ALPHA-001",
    "Endpoint",
    "PER-001",
    "LOC-001",
    "pending",
    daysFromToday(-72),
    daysFromToday(18),
    "high",
    "MBP16-2022-9981",
    "2022-04-12",
    "2025-04-12",
    "CC-ITOPS-001",
    ["High Value", "Executive"],
    [
      makeVerification(
        "VER-501",
        "AST-1001",
        -180,
        "passed",
        "PER-002",
        "Firmware baseline confirmed, encryption verified."
      ),
      makeVerification(
        "VER-502",
        "AST-1001",
        -75,
        "failed",
        "PER-002",
        "CrowdStrike agent offline for 3 days.",
        ["AV agent offline"]
      ),
    ]
  ),
  assetFactory(
    "AST-1002",
    "Cisco Catalyst 9500",
    "NET-CORE-014",
    "Network",
    "PER-002",
    "LOC-002",
    "verified",
    daysFromToday(-14),
    daysFromToday(166),
    "medium",
    "CAT9K-9500-4451",
    "2021-09-03",
    "2026-09-03",
    "CC-NET-204",
    ["Core Switch", "Critical"],
    [
      makeVerification(
        "VER-601",
        "AST-1002",
        -185,
        "passed",
        "PER-002",
        "IOS-XE updated, config archived."
      ),
      makeVerification(
        "VER-602",
        "AST-1002",
        -14,
        "passed",
        "PER-001",
        "Configuration diff clean, interfaces nominal."
      ),
    ]
  ),
  assetFactory(
    "AST-1003",
    "Dell PowerEdge R740",
    "SRV-COMPUTE-022",
    "Server",
    "PER-002",
    "LOC-002",
    "flagged",
    daysFromToday(-120),
    daysFromToday(-4),
    "high",
    "SVR-R740-3399",
    "2020-01-21",
    "2025-01-21",
    "CC-CLOUD-310",
    ["Hypervisor", "Cluster-A"],
    [
      makeVerification(
        "VER-701",
        "AST-1003",
        -210,
        "passed",
        "PER-003",
        "Baseline config validated, patch level current."
      ),
      makeVerification(
        "VER-702",
        "AST-1003",
        -35,
        "failed",
        "PER-004",
        "vCenter heartbeat alerts, failover aborted.",
        ["HA failover failed", "Firmware mismatch detected"]
      ),
    ]
  ),
  assetFactory(
    "AST-1004",
    "Lenovo ThinkPad X1",
    "IT-FIELD-114",
    "Endpoint",
    "PER-004",
    "LOC-004",
    "pending",
    daysFromToday(-54),
    daysFromToday(36),
    "medium",
    "LTPX1-2023-6611",
    "2023-06-01",
    "2026-06-01",
    "CC-FIELD-118",
    ["Remote Workforce"],
    [
      makeVerification(
        "VER-801",
        "AST-1004",
        -54,
        "in-progress",
        "PER-004",
        "Awaiting TPM attestation results."
      ),
    ]
  ),
  assetFactory(
    "AST-1005",
    "HP LaserJet M609",
    "PRT-OPS-004",
    "Peripheral",
    "PER-003",
    "LOC-003",
    "verified",
    daysFromToday(-21),
    daysFromToday(159),
    "low",
    "HPLJ-M609-4432",
    "2022-12-09",
    "2027-12-09",
    "CC-FAC-221",
    ["Shared Device"],
    [
      makeVerification(
        "VER-901",
        "AST-1005",
        -21,
        "passed",
        "PER-003",
        "Firmware patched and SNMP ACL tightened."
      ),
    ]
  ),
];

const activities: ActivityLog[] = [
  {
    id: "ACT-3001",
    type: "incident",
    title: "HA failover aborted on R740 cluster",
    description:
      "Automated verification caught misaligned firmware signature on node SRV-COMPUTE-022. Cluster placed in hold for remediation.",
    assetId: "AST-1003",
    personId: "PER-004",
    createdAt: daysFromToday(-2),
    status: "critical",
  },
  {
    id: "ACT-3002",
    type: "verification",
    title: "Encryption attestation outstanding",
    description:
      "ThinkPad X1 pending TPM attestation payload. Follow-up with field engineer scheduled for Friday.",
    assetId: "AST-1004",
    personId: "PER-004",
    createdAt: daysFromToday(-1),
    status: "warning",
  },
  {
    id: "ACT-3003",
    type: "asset",
    title: "New asset onboarding: M609 printer",
    description:
      "HP LaserJet added to London campus under shared services program. Auto-verification complete.",
    assetId: "AST-1005",
    personId: "PER-003",
    createdAt: daysFromToday(-5),
    status: "info",
  },
];

const tasks: VerificationTask[] = [
  {
    id: "TASK-9001",
    assetId: "AST-1001",
    dueDate: daysFromToday(18),
    assignedToId: "PER-001",
    status: "scheduled",
    priority: "high",
    checklist: [
      "Validate endpoint protection agent",
      "Capture FileVault escrow ticket",
      "Reconcile asset tag with ServiceNow",
    ],
  },
  {
    id: "TASK-9002",
    assetId: "AST-1003",
    dueDate: daysFromToday(2),
    assignedToId: "PER-002",
    status: "in-progress",
    priority: "high",
    checklist: [
      "Confirm firmware flash rollback",
      "Verify HA cluster heartbeat",
      "Document remediation evidence",
    ],
  },
  {
    id: "TASK-9003",
    assetId: "AST-1004",
    dueDate: daysFromToday(6),
    assignedToId: "PER-004",
    status: "scheduled",
    priority: "medium",
    checklist: [
      "Collect TPM report",
      "Refresh Intune compliance",
      "Capture user acknowledgement",
    ],
  },
];

const linkAssetsToLocations = (assetList: Asset[], locationList: Location[]) =>
  locationList.map((location) => ({
    ...location,
    assetIds: assetList
      .filter((asset) => asset.locationId === location.id)
      .map((asset) => asset.id),
  }));

export const initialPeople = people;
export const initialAssets = assets;
export const initialLocations = linkAssetsToLocations(assets, locations);
export const initialActivities = activities;
export const initialTasks = tasks;
