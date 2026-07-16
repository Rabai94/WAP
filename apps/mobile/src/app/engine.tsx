import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import RabaiHomePage from "@/components/home/RabaiHomePage";
import { useAuth } from "@/providers/AuthProvider";

export default function EngineScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  async function handleLogout() {
    await signOut();
    router.replace("/" as never);
  }

  return (
    <RequireAuth>
      <RabaiHomePage authState="authenticated" user={user} onLogout={handleLogout} />
    </RequireAuth>
  );
}
