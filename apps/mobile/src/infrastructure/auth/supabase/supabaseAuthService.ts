import type {
    AuthRole,
    AuthSession,
    AuthUser,
    PublicAuthRole,
} from "@/domain/auth/auth.types";
import type {
  AccountType,
  LegacyAccountType,
  OnboardingIntent,
  PersonalInterest,
} from "@/domain/account/types";
import type { AuthService } from "@/services/auth/authService";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

const publicAuthRoles: PublicAuthRole[] = [
  "student",
  "worker",
  "business",
  "freelancer",
];

const profileSelect = "id,email,full_name,phone,role" as const;
const legacyAccountTypes: LegacyAccountType[] = ["personal", "organization"];
const onboardingIntents: OnboardingIntent[] = [
  "personal",
  "create_organization",
];
const personalInterests: PersonalInterest[] = [
  "find_jobs",
  "find_tasks",
  "offer_services",
  "request_service",
  "find_courses",
  "explore_only",
];

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: PublicAuthRole;
};

function mapPublicRole(role: unknown): PublicAuthRole | undefined {
  return publicAuthRoles.includes(role as PublicAuthRole)
    ? (role as PublicAuthRole)
    : undefined;
}

function mapPublicRoles(roles: unknown): PublicAuthRole[] {
  const values = Array.isArray(roles) ? roles : [roles];

  return values.flatMap((role) => {
    const mappedRole = mapPublicRole(role);
    return mappedRole ? [mappedRole] : [];
  });
}

function mapLegacyAccountType(value: unknown): LegacyAccountType | undefined {
  return legacyAccountTypes.includes(value as LegacyAccountType)
    ? (value as LegacyAccountType)
    : undefined;
}

function mapOnboardingIntent(value: unknown): OnboardingIntent | undefined {
  return onboardingIntents.includes(value as OnboardingIntent)
    ? (value as OnboardingIntent)
    : undefined;
}

function getOnboardingIntentFromLegacyAccountType(
  legacyAccountType: LegacyAccountType | undefined
): OnboardingIntent | undefined {
  if (legacyAccountType === "organization") {
    return "create_organization";
  }

  return legacyAccountType;
}

function uniqueRoles(roles: AuthRole[]) {
  return [...new Set(roles)];
}

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const joined = value
      .filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
      .join(", ");

    return joined || undefined;
  }

  return undefined;
}

function getMetadataStringArray(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    );
  }

  const stringValue = getMetadataString(metadata, key);

  return stringValue ? [stringValue] : [];
}

function mapPersonalInterests(value: unknown): PersonalInterest[] {
  const values = Array.isArray(value) ? value : [];

  return values.filter((item): item is PersonalInterest =>
    personalInterests.includes(item as PersonalInterest)
  );
}

function getFallbackPublicRole(user: User) {
  const appMetadata = user.app_metadata ?? {};
  const userMetadata = user.user_metadata ?? {};

  return (
    mapPublicRole(appMetadata.role) ??
    mapPublicRoles(appMetadata.roles)[0] ??
    mapPublicRole(userMetadata.role) ??
    mapPublicRoles(userMetadata.roles)[0] ??
    "worker"
  );
}

function isAdminFromAppMetadata(appMetadata: Record<string, unknown>) {
  const appMetadataRoles = Array.isArray(appMetadata.roles)
    ? appMetadata.roles
    : [];

  return appMetadata.role === "admin" || appMetadataRoles.includes("admin");
}

function mapSupabaseUser(
  user: User,
  profile: ProfileRow | null = null
): AuthUser {
  const appMetadata = user.app_metadata ?? {};
  const userMetadata = user.user_metadata ?? {};
  const trustedAdmin = isAdminFromAppMetadata(appMetadata);
  const profileRole = mapPublicRole(profile?.role);
  const legacyAccountType =
    mapLegacyAccountType(userMetadata.account_type) ??
    mapLegacyAccountType(userMetadata.accountType);
  const onboardingIntent =
    mapOnboardingIntent(userMetadata.onboarding_intent) ??
    mapOnboardingIntent(userMetadata.onboardingIntent) ??
    getOnboardingIntentFromLegacyAccountType(legacyAccountType);

  const publicRoles = uniqueRoles([
    ...(profileRole ? [profileRole] : []),
    ...mapPublicRoles(appMetadata.role),
    ...mapPublicRoles(appMetadata.roles),
    ...mapPublicRoles(userMetadata.role),
    ...mapPublicRoles(userMetadata.roles),
  ]);

  const roles = uniqueRoles([
    ...(trustedAdmin ? (["admin"] as const) : []),
    ...publicRoles,
    ...(!trustedAdmin && publicRoles.length === 0 ? (["worker"] as const) : []),
  ]);
  const role =
    profileRole ?? publicRoles[0] ?? (trustedAdmin ? "admin" : "worker");

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    role,
    roles,
    accountType: "personal",
    onboardingIntent,
    interests: mapPersonalInterests(userMetadata.interests),
    isAdmin: trustedAdmin,
    fullName:
      profile?.full_name ??
      getMetadataString(userMetadata, "fullName") ??
      getMetadataString(userMetadata, "full_name") ??
      undefined,
    phone: profile?.phone ?? getMetadataString(userMetadata, "phone") ?? undefined,
    location: getMetadataString(userMetadata, "location") ?? undefined,
    nationality: getMetadataString(userMetadata, "nationality") ?? undefined,
    workCategory:
      getMetadataString(userMetadata, "workCategory") ??
      getMetadataString(userMetadata, "category") ??
      undefined,
    skills: getMetadataString(userMetadata, "skills") ?? undefined,
    language: getMetadataString(userMetadata, "language") ?? undefined,
    languages: getMetadataStringArray(userMetadata, "languages"),
    experience: getMetadataString(userMetadata, "experience") ?? undefined,
    education: getMetadataString(userMetadata, "education") ?? undefined,
    qualifications: getMetadataString(userMetadata, "qualifications") ?? undefined,
    availability: getMetadataString(userMetadata, "availability") ?? undefined,
    preferredWorkType:
      getMetadataString(userMetadata, "preferredWorkType") ??
      getMetadataString(userMetadata, "workType") ??
      undefined,
    servicePreferences:
      getMetadataString(userMetadata, "servicePreferences") ?? undefined,
    hourlyRate: getMetadataString(userMetadata, "hourlyRate") ?? undefined,
    emailVerified: typeof user.email_confirmed_at === "string" && user.email_confirmed_at.length > 0,
  };
}

function mapSessionWithoutProfile(session: Session | null): AuthSession | null {
  if (!session) {
    return null;
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: mapSupabaseUser(session.user),
  };
}

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "RabAI profile load failed.");
  }

  return data as ProfileRow | null;
}

async function createMissingProfile(user: User) {
  const userMetadata = user.user_metadata ?? {};

  const profile = {
    id: user.id,
    email: user.email ?? null,
    full_name:
      getMetadataString(userMetadata, "fullName") ??
      getMetadataString(userMetadata, "full_name") ??
      null,
    phone: getMetadataString(userMetadata, "phone") ?? null,
    role: getFallbackPublicRole(user),
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select(profileSelect)
    .single();

  if (!error) {
    return data as ProfileRow;
  }

  if (error.code === "23505") {
    const existingProfile = await fetchProfile(user.id);

    if (existingProfile) {
      return existingProfile;
    }
  }

  throw new Error(error.message || "RabAI profile creation failed.");
}

async function getOrCreateProfile(user: User) {
  const profile = await fetchProfile(user.id);

  if (profile) {
    return profile;
  }

  return createMissingProfile(user);
}

async function mapSupabaseSession(
  session: Session | null
): Promise<AuthSession | null> {
  if (!session) {
    return null;
  }

  const profile = await getOrCreateProfile(session.user);

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: mapSupabaseUser(session.user, profile),
  };
}

export const supabaseAuthService: AuthService = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message || "RabAI session load failed.");
    }

    return mapSupabaseSession(data.session);
  },

  async signUp(input) {
    const publicRole = input.role ? mapPublicRole(input.role) : undefined;
    const onboardingIntent = mapOnboardingIntent(input.onboardingIntent);

    if (input.role && !publicRole) {
      throw new Error("RabAI admin accounts must be assigned server-side.");
    }

    if (!onboardingIntent) {
      throw new Error("Invalid RabAI onboarding intent.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          fullName: input.fullName,
          phone: input.phone,
          accountType: "personal" satisfies AccountType,
          onboardingIntent,
        },
      },
    });

    if (error) {
      throw new Error(error.message || "RabAI sign up failed.");
    }

    const session = await mapSupabaseSession(data.session);

    return {
      session,
      user: session?.user ?? (data.user ? mapSupabaseUser(data.user) : null),
    };
  },

  async signIn(input) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message || "RabAI login failed.");
    }

    const session = await mapSupabaseSession(data.session);

    return {
      session,
      user: session?.user ?? (data.user ? mapSupabaseUser(data.user) : null),
    };
  },

  async resendEmailConfirmation(email) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      throw new Error(
        error.message || "RabAI email confirmation resend failed."
      );
    }
  },

  async sendEmailOtp(email, options) {
    const publicRole = options?.role ? mapPublicRole(options.role) : undefined;

    if (options?.role && !publicRole) {
      throw new Error("RabAI admin accounts must be assigned server-side.");
    }

    const metadata = {
      ...(publicRole ? { role: publicRole } : {}),
      ...(options?.fullName ? { full_name: options.fullName } : {}),
      ...(options?.phone ? { phone: options.phone } : {}),
    };

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: options?.shouldCreateUser ?? true,
        ...(Object.keys(metadata).length > 0 ? { data: metadata } : {}),
      },
    });

    if (error) {
      throw new Error(error.message || "RabAI email OTP send failed.");
    }
  },

  async verifyEmailOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      throw new Error(error.message || "RabAI email OTP verification failed.");
    }

    const session = await mapSupabaseSession(data.session);

    return {
      session,
      user: session?.user ?? (data.user ? mapSupabaseUser(data.user) : null),
    };
  },

  async updateOnboardingIntent(onboardingIntent) {
    if (!mapOnboardingIntent(onboardingIntent)) {
      throw new Error("Invalid RabAI onboarding intent.");
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        account_type: "personal" satisfies AccountType,
        onboarding_intent: onboardingIntent,
      },
    });

    if (error) {
      throw new Error(error.message || "RabAI onboarding update failed.");
    }

    return this.getSession();
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message || "RabAI logout failed.");
    }
  },

  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void mapSupabaseSession(session)
        .then(callback)
        .catch((error: unknown) => {
          console.error("RabAI auth profile sync failed", error);
          callback(mapSessionWithoutProfile(session));
        });
    });

    return {
      unsubscribe() {
        subscription.unsubscribe();
      },
    };
  },
};
