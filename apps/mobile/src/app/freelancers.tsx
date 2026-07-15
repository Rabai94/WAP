import { Redirect } from "expo-router";

export default function LegacyFreelancersRedirect() {
  return <Redirect href={"/services" as any} />;
}
