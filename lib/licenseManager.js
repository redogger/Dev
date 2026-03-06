/**
 * GReg IDE — License Manager
 * Handles generation, validation, tier control, and revocation.
 * In production, replace localStorage with a DB/Redis layer.
 */

export const TIERS = {
  STANDARD: {
    id: "STANDARD",
    label: "Standard",
    color: "#8b949e",
    features: ["classic_ui", "basic_export", "execution"],
    maxDevices: 1,
    themes: ["classic"],
  },
  PRO: {
    id: "PRO",
    label: "Pro",
    color: "#58a6ff",
    features: ["classic_ui", "modern_ui", "mac_export", "pdf_export", "mutation_engine", "execution", "assignment_library"],
    maxDevices: 3,
    themes: ["classic", "midnight", "neon"],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    label: "Enterprise",
    color: "#c9a227",
    features: ["all"],
    maxDevices: 999,
    themes: ["classic", "midnight", "neon"],
    adminAccess: true,
  },
};

// ── Key generation ─────────────────────────────────────────────────────────
function segment(len = 4) {
  return Math.random().toString(36).toUpperCase().slice(2, 2 + len).padEnd(len, "X");
}
export function generateKey(tier = "PRO") {
  const prefix = { STANDARD: "STD", PRO: "PRO", ENTERPRISE: "ENT" }[tier] || "PRO";
  return `GREG-${prefix}-${segment()}-${segment()}-${segment()}`;
}

// ── Default seed licenses (shown in admin demo) ────────────────────────────
export const SEED_LICENSES = [
  {
    id: "lic-001",
    key: "GREG-ENT-ABCD-EFGH-IJKL",
    tier: "ENTERPRISE",
    issuedTo: "Cairo University — CS Dept",
    email: "admin@cu.edu.eg",
    issuedAt: "2024-09-01",
    expiresAt: "2025-09-01",
    maxDevices: 999,
    activeDevices: 42,
    status: "active",
    executions: 15820,
    hoursLogged: 334,
  },
  {
    id: "lic-002",
    key: "GREG-PRO-XK9P-MQ3R-WZ8T",
    tier: "PRO",
    issuedTo: "Student Lab — Block C",
    email: "lab-c@cu.edu.eg",
    issuedAt: "2024-10-15",
    expiresAt: "2025-10-15",
    maxDevices: 3,
    activeDevices: 3,
    status: "active",
    executions: 2340,
    hoursLogged: 88,
  },
  {
    id: "lic-003",
    key: "GREG-STD-Y7VL-NF2W-PD5S",
    tier: "STANDARD",
    issuedTo: "Ahmed Hassan",
    email: "ahmed.h@cu.edu.eg",
    issuedAt: "2024-08-01",
    expiresAt: "2024-12-31",
    maxDevices: 1,
    activeDevices: 1,
    status: "expired",
    executions: 890,
    hoursLogged: 22,
  },
  {
    id: "lic-004",
    key: "GREG-PRO-TR4C-KI2N-GB6W",
    tier: "PRO",
    issuedTo: "Trial — Demo",
    email: "trial@greg.io",
    issuedAt: "2024-12-01",
    expiresAt: "2025-01-01",
    maxDevices: 1,
    activeDevices: 0,
    status: "trial",
    executions: 45,
    hoursLogged: 2,
  },
];

// ── Validate key ───────────────────────────────────────────────────────────
export function validateKey(key, licenses = SEED_LICENSES) {
  const lic = licenses.find(l => l.key === key?.trim().toUpperCase());
  if (!lic) return { valid: false, reason: "Key not found" };
  if (lic.status === "revoked") return { valid: false, reason: "Key revoked" };
  if (lic.status === "expired") return { valid: false, reason: "Key expired" };
  if (lic.activeDevices >= lic.maxDevices && lic.maxDevices < 999)
    return { valid: false, reason: `Device limit reached (${lic.maxDevices})` };
  return { valid: true, license: lic, tier: TIERS[lic.tier] };
}

// ── Check feature access ───────────────────────────────────────────────────
export function hasFeature(tier, feature) {
  if (!tier) return false;
  if (tier.features?.includes("all")) return true;
  return tier.features?.includes(feature) || false;
}

// ── Analytics helpers ──────────────────────────────────────────────────────
export function getAnalyticsSummary(licenses = SEED_LICENSES) {
  return {
    totalLicenses:   licenses.length,
    activeLicenses:  licenses.filter(l => l.status === "active").length,
    expiredLicenses: licenses.filter(l => l.status === "expired").length,
    totalExecutions: licenses.reduce((s, l) => s + (l.executions || 0), 0),
    totalHours:      licenses.reduce((s, l) => s + (l.hoursLogged || 0), 0),
    totalDevices:    licenses.reduce((s, l) => s + (l.activeDevices || 0), 0),
  };
}
