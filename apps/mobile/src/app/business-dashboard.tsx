import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";

export default function BusinessDashboardScreen() {
  return (
    <RequireAuth requiredRole="business">
      <BusinessDashboardContent />
    </RequireAuth>
  );
}

function BusinessDashboardContent() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { t } = useLanguage();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canPublishJobs =
    company?.status === "active" &&
    company.verification_status === "verified";

  useEffect(() => {
    let mounted = true;

    async function loadCompany() {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const nextCompany = await fetchOwnCompany(user.id);

        if (mounted) {
          setCompany(nextCompany);
        }
      } catch (nextError) {
        if (mounted) {
          setError(readError(nextError));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCompany();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  async function handleLogout() {
    await signOut();
    router.replace("/login" as any);
  }

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/engine" as any)}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>{t("common.home")}</Text>
          </Pressable>
        </View>

        <Header
          title={t("businessDashboard.title")}
          subtitle={t("businessDashboard.subtitle")}
        />

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>Se incarca profilul companiei...</Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {company ? (
          <>
            <Card title={t("profile.businessProfileTitle")}>
              <Text style={styles.profileName}>{company.name}</Text>
              <InfoLine label="Denumire legala" value={company.legal_name} />
              <InfoLine label="Industrie" value={company.industry} />
              <InfoLine label="Oras" value={company.city} />
              <InfoLine label="Cod postal" value={company.postal_code} />
              <InfoLine label="Adresa" value={company.address} />
              <InfoLine label="Website" value={company.website} />
              <InfoLine
                label="Angajati"
                value={company.employee_count_range}
              />
              <InfoLine
                label={t("profile.verificationStatus")}
                value={formatVerificationStatus(company.verification_status)}
                highlighted={company.verification_status === "verified"}
              />
              <InfoLine
                label="Status companie"
                value={formatCompanyStatus(company.status)}
              />
            </Card>

            <Card title="Publicare joburi">
              {canPublishJobs ? (
                <Text style={styles.item}>
                  Compania este verificata. Poti publica joburi reale in RabAI.
                </Text>
              ) : (
                <Text style={styles.item}>
                  Publicarea joburilor este blocata pana cand compania este
                  verificata de admin.
                </Text>
              )}
            </Card>
          </>
        ) : !loading ? (
          <Card title="Compania ta">
            <Text style={styles.emptyText}>
              Nu exista inca o companie asociata contului tau. Creeaza profilul
              companiei pentru a putea incepe procesul de verificare.
            </Text>
          </Card>
        ) : null}

        <Button
          title={company ? "Editeaza compania" : "Creeaza compania"}
          onPress={() => {
            router.push("/business-form" as any);
          }}
        />

        <Button
          disabled={!canPublishJobs}
          title={t("businessDashboard.createJob")}
          style={styles.secondaryButton}
          onPress={() => {
            router.push("/create-job" as any);
          }}
        />

        <Button
          title={t("businessDashboard.viewApplications")}
          variant="secondary"
          style={styles.secondaryButton}
          onPress={() => {
            router.push("/applications" as any);
          }}
        />

        <Button
          title={t("common.logout")}
          variant="ghost"
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </ScrollView>
    </Screen>
  );
}

function InfoLine({
  highlighted,
  label,
  value,
}: {
  highlighted?: boolean;
  label: string;
  value?: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <Text style={styles.item}>
      {label}:{" "}
      <Text style={highlighted ? styles.verifiedText : styles.itemValue}>
        {value}
      </Text>
    </Text>
  );
}

function formatVerificationStatus(value: string) {
  if (value === "verified") {
    return "verificata";
  }

  if (value === "rejected") {
    return "respinsa";
  }

  return "in asteptare";
}

function formatCompanyStatus(value: string) {
  if (value === "active") {
    return "activa";
  }

  if (value === "suspended") {
    return "suspendata";
  }

  if (value === "archived") {
    return "arhivata";
  }

  return value;
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut incarca profilul companiei.";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.five,
  },
  topBar: {
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  homeButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  homeButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  profileName: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },
  item: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.md,
  },
  itemValue: {
    color: Colors.text,
    fontWeight: Typography.fontWeight.bold,
  },
  verifiedText: {
    color: Colors.success,
    fontWeight: Typography.fontWeight.extraBold,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.subtitle,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  secondaryButton: {
    marginTop: Spacing.xl,
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
});
