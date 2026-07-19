import { useEffect } from "react";
import { useRouter } from "expo-router";
import RabaiHomePage from "@/components/home/RabaiHomePage";
import { useAuth } from "@/providers/AuthProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { isSigningOut, loading: authLoading, session } = useAuth();

  useEffect(() => {
    if (!authLoading && !isSigningOut && session) {
      router.replace("/engine" as never);
    }
  }, [authLoading, isSigningOut, router, session]);

  return <RabaiHomePage authState="public" />;
}
