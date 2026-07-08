import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AuthSession,
  AuthUser,
  SendEmailOtpOptions,
  SignInInput,
  SignUpInput,
} from "@/domain/auth/auth.types";
import { authService } from "@/services/auth";

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  signUp: (
    input: SignUpInput
  ) => Promise<{ session: AuthSession | null; user: AuthUser | null }>;
  signIn: (
    input: SignInInput
  ) => Promise<{ session: AuthSession | null; user: AuthUser | null }>;
  resendEmailConfirmation: (email: string) => Promise<void>;
  sendEmailOtp: (
    email: string,
    options?: SendEmailOtpOptions
  ) => Promise<void>;
  verifyEmailOtp: (
    email: string,
    token: string
  ) => Promise<{ session: AuthSession | null; user: AuthUser | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authService
      .getSession()
      .then((nextSession) => {
        if (!isMounted) {
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      })
      .catch((error: unknown) => {
        console.error("RabAI auth session load failed", error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const subscription = authService.onAuthStateChange((nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      async signUp(input) {
        const result = await authService.signUp(input);

        setSession(result.session);
        setUser(result.session?.user ?? result.user);

        return result;
      },
      async signIn(input) {
        const result = await authService.signIn(input);

        setSession(result.session);
        setUser(result.session?.user ?? result.user);

        return result;
      },
      async resendEmailConfirmation(email) {
        await authService.resendEmailConfirmation(email);
      },
      async sendEmailOtp(email, options) {
        await authService.sendEmailOtp(email, options);
      },
      async verifyEmailOtp(email, token) {
        const result = await authService.verifyEmailOtp(email, token);

        setSession(result.session);
        setUser(result.session?.user ?? result.user);

        return result;
      },
      async signOut() {
        await authService.signOut();
        setSession(null);
        setUser(null);
      },
    }),
    [loading, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
