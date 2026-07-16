import type {
  AccountType,
  OnboardingIntent,
  PersonalInterest,
} from "@/domain/account/types";

export type LegacyAuthRole =
  | "admin"
  | "student"
  | "worker"
  | "business"
  | "freelancer";

export type AuthRole = LegacyAuthRole;

export type PublicAuthRole = Exclude<AuthRole, "admin">;

export type AppUser = {
  id: string;
  email: string | null;
  role: AuthRole;
  roles: AuthRole[];
  accountType?: AccountType;
  onboardingIntent?: OnboardingIntent;
  interests?: PersonalInterest[];
  isAdmin: boolean;
  fullName?: string;
  phone?: string;
  location?: string;
  nationality?: string;
  workCategory?: string;
  skills?: string;
  language?: string;
  languages?: string[];
  experience?: string;
  education?: string;
  qualifications?: string;
  availability?: string;
  preferredWorkType?: string;
  servicePreferences?: string;
  hourlyRate?: string;
  emailVerified?: boolean;
};

export type AuthUser = AppUser;

export type AuthSession = {
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
};

export type SignUpInput = {
  email: string;
  password: string;
  accountType?: AccountType;
  role?: PublicAuthRole;
  onboardingIntent: OnboardingIntent;
  fullName: string;
  phone?: string;
  location?: string;
  workCategory?: string;
  skills?: string;
  language?: string;
  experience?: string;
  availability?: string;
  preferredWorkType?: string;
  hourlyRate?: string;
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
