import { Redirect } from "expo-router";

export default function LegacyBusinessFormRedirect() {
  return <Redirect href={"/organizations/create" as any} />;
}
