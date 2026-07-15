import { Redirect } from "expo-router";

export default function LegacyCompaniesRedirect() {
  return <Redirect href={"/organizations" as any} />;
}
