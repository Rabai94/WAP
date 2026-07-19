import EngineDashboard from "@/components/engine/EngineDashboard";
import RequireAuth from "@/components/RequireAuth";

export default function EngineScreen() {
  return (
    <RequireAuth>
      <EngineDashboard />
    </RequireAuth>
  );
}
