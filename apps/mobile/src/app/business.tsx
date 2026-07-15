import { Redirect } from "expo-router";

export default function LegacyBusinessRedirect() {
  return <Redirect href={"/organizations" as any} />;
}
