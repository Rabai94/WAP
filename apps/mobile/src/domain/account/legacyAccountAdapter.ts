import type { LegacyAuthRole } from "@/domain/auth/auth.types";
import type {
  AccountCompatibilityProfile,
  OrganizationType,
  PersonalInterest,
  ProfileCapability,
} from "./types";

type LegacyRolePreset = {
  capabilities: ProfileCapability[];
  interests: PersonalInterest[];
  managedOrganizationTypes?: OrganizationType[];
};

const personalBaseCapabilities: ProfileCapability[] = [
  "apply_to_jobs",
  "apply_to_tasks",
  "request_services",
  "enroll_in_courses",
];

const legacyRolePresets: Record<Exclude<LegacyAuthRole, "admin">, LegacyRolePreset> = {
  business: {
    capabilities: [
      ...personalBaseCapabilities,
      "manage_organizations",
      "publish_jobs",
    ],
    interests: ["find_jobs", "find_tasks", "request_service"],
    managedOrganizationTypes: ["company"],
  },
  freelancer: {
    capabilities: [
      ...personalBaseCapabilities,
      "offer_services",
    ],
    interests: ["offer_services", "find_tasks"],
  },
  student: {
    capabilities: personalBaseCapabilities,
    interests: ["find_courses", "find_jobs"],
  },
  worker: {
    capabilities: personalBaseCapabilities,
    interests: ["find_jobs", "find_tasks"],
  },
};

const adminPreset: LegacyRolePreset = {
  capabilities: [
    ...personalBaseCapabilities,
    "offer_services",
    "manage_organizations",
    "publish_jobs",
    "publish_courses",
  ],
  interests: [
    "find_jobs",
    "find_tasks",
    "offer_services",
    "request_service",
    "find_courses",
    "explore_only",
  ],
  managedOrganizationTypes: ["company", "academy"],
};

export function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}

export function getCompatibilityProfileFromLegacyRoles(
  roles: LegacyAuthRole[] | null | undefined
): AccountCompatibilityProfile {
  const safeRoles: LegacyAuthRole[] = roles?.length ? roles : ["worker"];
  const presets = safeRoles.map((role) =>
    role === "admin" ? adminPreset : legacyRolePresets[role]
  );

  // Temporary bridge: the backend still persists profiles.role and worker_profiles.
  // These mappings expose Personal Account interests/capabilities without allowing
  // user_metadata to grant admin privileges or replacing the existing role guards.
  return {
    accountType: "personal",
    capabilities: uniqueValues(presets.flatMap((preset) => preset.capabilities)),
    interests: uniqueValues(presets.flatMap((preset) => preset.interests)),
    managedOrganizationTypes: uniqueValues(
      presets.flatMap((preset) => preset.managedOrganizationTypes ?? [])
    ),
    verificationLevel: 0,
  };
}

export function hasProfileCapability(
  compatibilityProfile: AccountCompatibilityProfile,
  capability: ProfileCapability
) {
  return compatibilityProfile.capabilities.includes(capability);
}
