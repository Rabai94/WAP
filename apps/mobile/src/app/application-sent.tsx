import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { buildJobDetailsPath } from "@/services/jobs/jobNavigation";

export default function ApplicationSentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    applicationId?: string | string[];
    jobId?: string | string[];
  }>();
  const applicationId = readParam(params.applicationId);
  const jobId = readParam(params.jobId);

  return (
    <RequireAuth>
      <Screen>
        <Header
          icon="OK"
          title="Aplicatia a fost trimisa"
          subtitle="Organizatia va vedea aplicatia in lista de aplicatii."
          hero
        />

        <Card title="Ce urmeaza">
          <Text style={styles.item}>
            Aplicatia este inregistrata cu statusul trimisa.
          </Text>
          <Text style={styles.item}>
            Poti urmari oportunitatile din profilul tau RabAI.
          </Text>
          {applicationId ? (
            <Text style={styles.reference}>ID aplicatie: {applicationId}</Text>
          ) : null}
        </Card>

        <Button
          title="Vezi profilul"
          onPress={() => {
            router.replace("/profile" as any);
          }}
        />

        {jobId ? (
          <Button
            title="Inapoi la job"
            variant="secondary"
            style={styles.secondaryButton}
            onPress={() => {
              router.replace(
                buildJobDetailsPath(jobId, "/profile") as any
              );
            }}
          />
        ) : null}
      </Screen>
    </RequireAuth>
  );
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  item: {
    color: Colors.textBody,
    fontSize: Typography.body,
    marginBottom: Spacing.md,
  },
  reference: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});
