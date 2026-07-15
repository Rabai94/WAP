import { Redirect } from "expo-router";

export default function LegacyWorkerFormRedirect() {
  return <Redirect href={"/profile/edit" as any} />;
}
