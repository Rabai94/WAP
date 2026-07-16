import { Redirect } from "expo-router";

export default function LegacyWorkerRedirect() {
  return <Redirect href={"/profile" as any} />;
}
