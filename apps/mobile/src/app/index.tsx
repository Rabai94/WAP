import { useEffect } from "react";
import { useRouter } from "expo-router";
import RabaiHomePage from "@/components/home/RabaiHomePage";
import { useAuth } from "@/providers/AuthProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { loading: authLoading, session } = useAuth();

  useEffect(() => {
    if (!authLoading && session) {
      router.replace("/engine" as never);
    }
  }, [authLoading, router, session]);

  return <RabaiHomePage authState="public" />;
}
