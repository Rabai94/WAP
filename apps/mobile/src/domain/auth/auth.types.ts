export type AuthRole =
  | "admin"
  | "student"
  | "worker"
  | "business"
  | "freelancer";

export type PublicAuthRole = Exclude<AuthRole, "admin">;

export type AuthUser = {
  id: string;
  email: string | null;
  role?: AuthRole;
  roles?: AuthRole[];
  isAdmin?: boolean;
  fullName?: string;
  phone?: string;
};

export type AuthSession = {
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
};

export type SignUpInput = {
  email: string;
  password: string;
  role: PublicAuthRole;
  fullName: string;
  phone?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SendEmailOtpOptions = {
  shouldCreateUser?: boolean;
  role?: PublicAuthRole;
  fullName?: string;
  phone?: string;
};
