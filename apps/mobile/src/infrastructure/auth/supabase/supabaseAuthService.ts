import type { Session, User } from "@supabase/supabase-js";
import type {
  AuthRole,
  AuthSession,
  AuthUser,
  PublicAuthRole,
} from "@/domain/auth/auth.types";
import type { AuthService } from "@/services/auth/authService";
import { supabase } from "./supabaseClient";

const publicAuthRoles: PublicAuthRole[] = [
  "student",
  "worker",
  "business",
  "freelancer",
];

const profileSelect = "id,email,full_name,phone,role" as const;

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

function uniqueRoles(roles: AuthRole[]) {
  return [...new Set(roles)];
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : undefined;
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
    isAdmin: trustedAdmin,
    fullName:
      profile?.full_name ??
      getMetadataString(userMetadata, "full_name") ??
      undefined,
    phone: profile?.phone ?? getMetadataString(userMetadata, "phone"),
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
    full_name: getMetadataString(userMetadata, "full_name") ?? null,
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
    const publicRole = mapPublicRole(input.role);

    if (!publicRole) {
      throw new Error("RabAI admin accounts must be assigned server-side.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          role: publicRole,
          full_name: input.fullName,
          phone: input.phone,
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
