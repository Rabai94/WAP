import { Redirect } from "expo-router";

export default function LegacyWorkerDashboardRedirect() {
  return <Redirect href={"/profile" as any} />;
}
