import { Redirect } from "expo-router";

export default function LegacyBusinessDashboardRedirect() {
  return <Redirect href={"/organizations" as any} />;
}
