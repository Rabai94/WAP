import type { Session, User } from "@supabase/supabase-js";
import type {
  AuthRole,
  AuthSession,
  AuthUser,
  PublicAuthRole,
} from "@/domain/auth/auth.types";
import type { AuthService } from "@/services/auth/authService";
import { supabase } from "./supabaseClient";

const authRoles: AuthRole[] = [
  "admin",
  "student",
  "worker",
  "business",
  "freelancer",
];

const publicAuthRoles: PublicAuthRole[] = [
  "student",
  "worker",
  "business",
  "freelancer",
];

function mapRole(role: unknown): AuthRole | undefined {
  return authRoles.includes(role as AuthRole) ? (role as AuthRole) : undefined;
}

function mapPublicRole(role: unknown): PublicAuthRole | undefined {
  return publicAuthRoles.includes(role as PublicAuthRole)
    ? (role as PublicAuthRole)
    : undefined;
}

function mapRoles(roles: unknown): AuthRole[] {
  const values = Array.isArray(roles) ? roles : [roles];

  return values.flatMap((role) => {
    const mappedRole = mapRole(role);
    return mappedRole ? [mappedRole] : [];
  });
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

function mapSupabaseUser(user: User): AuthUser {
  const appMetadata = user.app_metadata ?? {};
  const userMetadata = user.user_metadata ?? {};
  const trustedAppRoles = mapRoles(appMetadata.roles);
  const trustedAdmin =
    appMetadata.role === "admin" || trustedAppRoles.includes("admin");

  // Admin access must only come from trusted server-side app_metadata.
  // user_metadata is public/user-controlled and can only supply public roles.
  const roles = uniqueRoles([
    ...(trustedAdmin ? (["admin"] as const) : []),
    ...mapPublicRoles(appMetadata.role),
    ...mapPublicRoles(appMetadata.roles),
    ...mapPublicRoles(userMetadata.role),
    ...mapPublicRoles(userMetadata.roles),
  ]);

  return {
    id: user.id,
    email: user.email ?? null,
    role: roles[0],
    roles: roles.length > 0 ? roles : undefined,
    isAdmin: trustedAdmin,
    fullName:
      typeof userMetadata.full_name === "string"
        ? userMetadata.full_name
        : undefined,
    phone:
      typeof userMetadata.phone === "string" ? userMetadata.phone : undefined,
  };
}

function mapSupabaseSession(session: Session | null): AuthSession | null {
  if (!session) {
    return null;
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: mapSupabaseUser(session.user),
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

    return {
      session: mapSupabaseSession(data.session),
      user: data.user ? mapSupabaseUser(data.user) : null,
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

    return {
      session: mapSupabaseSession(data.session),
      user: data.user ? mapSupabaseUser(data.user) : null,
    };
  },

  async resendEmailConfirmation(email) {
    // TODO: Supabase email sender must be configured in Supabase Dashboard using Custom SMTP and Email Templates.
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

    // Supabase sends numeric codes only when the email template uses {{ .Token }}.
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

    return {
      session: mapSupabaseSession(data.session),
      user: data.user ? mapSupabaseUser(data.user) : null,
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
      callback(mapSupabaseSession(session));
    });

    return {
      unsubscribe() {
        subscription.unsubscribe();
      },
    };
  },
};
