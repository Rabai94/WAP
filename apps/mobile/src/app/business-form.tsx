import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Header, Input, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { mockBusinessProfile } from "@/domain/profile";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function BusinessFormScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const profile = mockBusinessProfile;
  const hiringRoles = profile.hiringNeeds.roles.map(t).join(", ");
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [city, setCity] = useState(profile.location);
  const [workType, setWorkType] = useState(hiringRoles);
  const [workersNeeded, setWorkersNeeded] = useState(
    String(profile.hiringNeeds.estimatedWorkers)
  );
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid RabAI account email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const fullName = contactName.trim() || companyName.trim();
      const result = await signUp({
        email: email.trim(),
        password,
        role: "business",
        fullName,
        phone: phone.trim(),
      });

      if (result.session) {
        router.replace("/engine" as any);
        return;
      }

      setSuccessMessage("Account created. Please verify your email, then log in.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "RabAI account creation failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <Header
        title={t("businessForm.title")}
        subtitle={t("businessForm.subtitle")}
      />

      <Input
        label={t("businessForm.companyName")}
        onChangeText={setCompanyName}
        placeholder={t("businessForm.companyNamePlaceholder")}
        value={companyName}
      />

      <Input
        label={t("businessForm.city")}
        onChangeText={setCity}
        placeholder={t("businessForm.cityPlaceholder")}
        value={city}
      />

      <Input
        label={t("businessForm.workType")}
        onChangeText={setWorkType}
        placeholder={t("businessForm.workTypePlaceholder")}
        value={workType}
      />

      <Input
        label={t("businessForm.workersNeeded")}
        onChangeText={setWorkersNeeded}
        placeholder={t("businessForm.workersNeededPlaceholder")}
        keyboardType="numeric"
        value={workersNeeded}
      />

      <Input
        label="Contact person"
        onChangeText={setContactName}
        placeholder="Your full name"
        value={contactName}
      />

      <Input
        autoCapitalize="none"
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="company@example.com"
        value={email}
      />

      <Input
        keyboardType="phone-pad"
        label="Phone"
        onChangeText={setPhone}
        placeholder="+49 170 1234567"
        value={phone}
      />

      <Input
        label="Password"
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        secureTextEntry
        value={password}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {successMessage ? (
        <View style={styles.successPanel}>
          <Text style={styles.successText}>{successMessage}</Text>
          <Button
            title="Go to login"
            variant="secondary"
            onPress={() => {
              router.replace("/login" as any);
            }}
          />
        </View>
      ) : null}

      <Button
        title={isSubmitting ? "Creating account..." : t("businessForm.save")}
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
              router.push("/business" as any);
            }
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: Colors.danger,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.xxl,
  },

  successPanel: {
    backgroundColor: Colors.surface,
    borderColor: Colors.success,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.three,
    padding: Spacing.three,
  },

  successText: {
    color: Colors.success,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.xl,
  },

  backButton: {
    marginTop: Spacing.xl,
  },
});
