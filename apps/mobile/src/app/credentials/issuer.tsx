import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  listIssuerCourses,
  type IssuerCourse,
} from "@/services/credentials/credentialService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function IssuerCredentialsScreen() {
  return (
    <RequireAuth>
      <IssuerCredentialsContent />
    </RequireAuth>
  );
}

function IssuerCredentialsContent() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<IssuerCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setCourses(await listIssuerCourses());
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("credentials.issuer.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCourses();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadCourses]);

  return (
    <Screen
      centered={false}
      style={{
        paddingHorizontal: responsive.horizontalPadding,
        paddingVertical: responsive.isMobile ? Spacing.three : Spacing.screen,
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { maxWidth: responsive.contentMaxWidth },
        ]}
      >
        <Header
          subtitle={t("credentials.issuer.subtitle")}
          title={t("credentials.issuer.title")}
        />

        <View style={styles.toolbar}>
          <Button
            onPress={() => router.push("/courses" as never)}
            title={t("credentials.issuer.backToCourses")}
            variant="secondary"
          />
          <Button
            disabled={loading}
            onPress={() => void loadCourses()}
            title={t("common.refresh")}
            variant="ghost"
          />
        </View>

        {loading ? <Card><Text style={styles.muted}>{t("common.loading")}</Text></Card> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        {!loading && !error && courses.length === 0 ? (
          <Card>
            <Text style={styles.muted}>{t("credentials.issuer.empty")}</Text>
          </Card>
        ) : null}

        <View style={styles.grid}>
          {courses.map((course) => (
            <Card key={course.course_id} style={styles.courseCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleBlock}>
                  <Text style={styles.courseTitle}>{course.course_title}</Text>
                  <Text style={styles.providerName}>{course.provider_name}</Text>
                </View>
                <View
                  style={[
                    styles.eligibility,
                    course.can_manage ? styles.eligible : styles.ineligible,
                  ]}
                >
                  <Text style={styles.eligibilityText}>
                    {course.can_manage
                      ? `✓ ${t("credentials.issuer.eligible")}`
                      : `! ${t("credentials.issuer.readOnly")}`}
                  </Text>
                </View>
              </View>

              <View style={styles.metrics}>
                <Metric
                  label={t("credentials.issuer.participants")}
                  value={course.participant_count}
                />
                <Metric
                  label={t("credentials.issuer.completions")}
                  value={course.completion_count}
                />
                <Metric
                  label={t("credentials.issuer.credentials")}
                  value={course.credential_count}
                />
              </View>

              <Text style={styles.meta}>
                {`${t("credentials.issuer.providerStatus")}: ${course.provider_status} / ${course.provider_verification_status}`}
              </Text>
              <Button
                onPress={() => router.push(`/courses/${course.course_id}/participants` as never)}
                style={styles.openButton}
                title={t("credentials.issuer.openParticipants")}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  courseCard: {
    flexBasis: 360,
    flexGrow: 1,
    marginBottom: 0,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    minWidth: 180,
  },
  courseTitle: {
    color: Colors.text,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.extraBold,
  },
  providerName: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  eligibility: {
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  eligible: {
    backgroundColor: "#E8F8F2",
    borderColor: "#8AD8BC",
  },
  ineligible: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
  },
  eligibilityText: {
    color: Colors.text,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  metric: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    flexGrow: 1,
    minWidth: 90,
    padding: Spacing.lg,
  },
  metricValue: {
    color: Colors.brandDeep,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.black,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: Spacing.xs,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: Spacing.lg,
  },
  openButton: {
    marginTop: Spacing.lg,
    width: "100%",
  },
  muted: {
    color: Colors.textMuted,
    fontSize: Typography.body,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
});
