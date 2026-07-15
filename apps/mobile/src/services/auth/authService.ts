import type {
  AuthSession,
  AuthUser,
  SendEmailOtpOptions,
  SignInInput,
  SignUpInput,
} from "@/domain/auth/auth.types";
import type { OnboardingIntent } from "@/domain/account/types";

export type AuthService = {
  getSession(): Promise<AuthSession | null>;
  signUp(
    input: SignUpInput
  ): Promise<{ session: AuthSession | null; user: AuthUser | null }>;
  signIn(
    input: SignInInput
  ): Promise<{ session: AuthSession | null; user: AuthUser | null }>;
  resendEmailConfirmation(email: string): Promise<void>;
  sendEmailOtp(
    email: string,
    options?: SendEmailOtpOptions
  ): Promise<void>;
  verifyEmailOtp(
    email: string,
    token: string
  ): Promise<{ session: AuthSession | null; user: AuthUser | null }>;
  updateOnboardingIntent(
    onboardingIntent: OnboardingIntent
  ): Promise<AuthSession | null>;
  signOut(): Promise<void>;
  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): { unsubscribe: () => void };
};
