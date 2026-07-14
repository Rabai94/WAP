import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  saveOwnCompany,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Header, Input, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";

type FormErrors = Partial<
  Record<"city" | "industry" | "name" | "website", string>
>;

const employeeCountOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

export default function BusinessFormScreen() {
  return (
    <RequireAuth requiredRole="business">
      <BusinessFormContent />
    </RequireAuth>
  );
}

function BusinessFormContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [employeeCountRange, setEmployeeCountRange] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCompany() {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const nextCompany = await fetchOwnCompany(user.id);

        if (!mounted) {
          return;
        }

        setCompany(nextCompany);

        if (nextCompany) {
          setName(nextCompany.name ?? "");
          setLegalName(nextCompany.legal_name ?? "");
          setIndustry(nextCompany.industry ?? "");
          setCity(nextCompany.city ?? "");
          setPostalCode(nextCompany.postal_code ?? "");
          setAddress(nextCompany.address ?? "");
          setWebsite(nextCompany.website ?? "");
          setEmployeeCountRange(nextCompany.employee_count_range ?? "");
          setDescription(nextCompany.description ?? "");
        }
      } catch (error) {
        if (mounted) {
          setLoadError(readError(error));
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

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    const normalizedWebsite = normalizeWebsite(website);
    const nextErrors = validateForm({
      city,
      industry,
      name,
      website,
      normalizedWebsite,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setLoadError("");

    try {
      await saveOwnCompany({
        address: emptyToNull(address),
        city: city.trim(),
        description: emptyToNull(description),
        employeeCountRange: emptyToNull(employeeCountRange),
        industry: industry.trim(),
        legalName: emptyToNull(legalName),
        name: name.trim(),
        postalCode: emptyToNull(postalCode),
        website: normalizedWebsite,
      });

      router.replace("/business-dashboard" as any);
    } catch (error) {
      setLoadError(readError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen centered={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={t("businessForm.title")}
          subtitle={
            company
              ? "Actualizeaza profilul companiei tale RabAI."
              : "Creeaza compania care va publica joburi in RabAI."
          }
        />

        {company ? (
          <Card title="Status verificare">
            <StatusRow company={company} />
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>Se incarca profilul companiei...</Text>
          </Card>
        ) : null}

        {loadError ? <Text style={styles.formError}>{loadError}</Text> : null}

        <Card title="Date companie">
          <Input
            editable={!submitting}
            label="Nume companie"
            onChangeText={setName}
            placeholder="ex: RabAI Logistics GmbH"
            value={name}
          />
          <FieldError message={errors.name} />

          <Input
            editable={!submitting}
            label="Denumire legala"
            onChangeText={setLegalName}
            placeholder="ex: RabAI Logistics GmbH"
            value={legalName}
          />

          <Input
            editable={!submitting}
            label="Industrie"
            onChangeText={setIndustry}
            placeholder="ex: Logistica si depozitare"
            value={industry}
          />
          <FieldError message={errors.industry} />

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Input
                editable={!submitting}
                label="Oras"
                onChangeText={setCity}
                placeholder="ex: Augsburg"
                value={city}
              />
              <FieldError message={errors.city} />
            </View>
            <View style={styles.column}>
              <Input
                editable={!submitting}
                label="Cod postal"
                onChangeText={setPostalCode}
                placeholder="ex: 86150"
                value={postalCode}
              />
            </View>
          </View>

          <Input
            editable={!submitting}
            label="Adresa"
            onChangeText={setAddress}
            placeholder="Strada, numar"
            value={address}
          />

          <Input
            autoCapitalize="none"
            editable={!submitting}
            keyboardType="url"
            label="Website"
            onChangeText={setWebsite}
            placeholder="https://example.com"
            value={website}
          />
          <FieldError message={errors.website} />
        </Card>

        <Card title="Profil operational">
          <Text style={styles.optionLabel}>Numar aproximativ de angajati</Text>
          <View style={styles.optionGrid}>
            {employeeCountOptions.map((option) => {
              const active = employeeCountRange === option;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  disabled={submitting}
                  key={option}
                  onPress={() => {
                    setEmployeeCountRange(option);
                  }}
                  style={[
                    styles.optionButton,
                    active && styles.optionButtonActive,
                    submitting && styles.optionButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            editable={!submitting}
            label="Descriere"
            multiline
            onChangeText={setDescription}
            placeholder="Descrie compania, activitatea si tipurile de roluri cautate."
            style={styles.bigInput}
            value={description}
          />
        </Card>

        <Button
          disabled={loading || submitting}
          title={submitting ? "Se salveaza..." : "Salveaza compania"}
          onPress={handleSubmit}
        />

        <View style={styles.backButton}>
          <Button
            title={t("common.back")}
            variant="secondary"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/business-dashboard" as any);
              }
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatusRow({ company }: { company: CompanyProfile }) {
  const verified = company.verification_status === "verified";

  return (
    <>
      <Text style={styles.statusText}>
        Verificare:{" "}
        <Text style={verified ? styles.verifiedText : styles.pendingText}>
          {formatVerificationStatus(company.verification_status)}
        </Text>
      </Text>
      <Text style={styles.mutedText}>
        Status operational: {formatCompanyStatus(company.status)}
      </Text>
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text style={styles.fieldError}>{message}</Text> : null;
}

function validateForm({
  city,
  industry,
  name,
  normalizedWebsite,
  website,
}: {
  city: string;
  industry: string;
  name: string;
  normalizedWebsite: string | null;
  website: string;
}) {
  const nextErrors: FormErrors = {};

  if (!name.trim()) {
    nextErrors.name = "Numele companiei este obligatoriu.";
  }

  if (!city.trim()) {
    nextErrors.city = "Orasul este obligatoriu.";
  }

  if (!industry.trim()) {
    nextErrors.industry = "Industria este obligatorie.";
  }

  if (website.trim() && !normalizedWebsite) {
    nextErrors.website = "Introdu un website valid.";
  }

  return nextErrors;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    const validProtocol = url.protocol === "http:" || url.protocol === "https:";
    const validHostname = url.hostname.includes(".");

    return validProtocol && validHostname ? url.toString() : null;
  } catch {
    return null;
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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
    : "Nu am putut salva compania.";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.five,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  statusText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  verifiedText: {
    color: Colors.success,
  },
  pendingText: {
    color: Colors.warningBorder,
  },
  formError: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
  },
  fieldError: {
    color: Colors.danger,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    marginTop: -Spacing.md,
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  column: {
    flexBasis: 220,
    flexGrow: 1,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionButtonActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#145CFF",
  },
  optionButtonDisabled: {
    opacity: 0.56,
  },
  optionText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  optionTextActive: {
    color: "#145CFF",
  },
  bigInput: {
    height: 120,
    textAlignVertical: "top",
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});
