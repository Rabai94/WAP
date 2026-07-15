import { Redirect } from "expo-router";

export default function LegacyRoleRedirect() {
  return <Redirect href={"/account-type" as any} />;
}
