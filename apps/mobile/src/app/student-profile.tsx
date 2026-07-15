import { Redirect } from "expo-router";

export default function LegacyStudentProfileRedirect() {
  return <Redirect href={"/profile" as any} />;
}
