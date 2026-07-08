import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  page: "#F8FAFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F6FF",
  ink: "#101828",
  muted: "#667085",
  line: "#D9E2F4",
  violet: "#6D28D9",
  violetDark: "#2E1065",
  red: "#E11D48",
  redSoft: "#FFE7EF",
  shadow: "#182033",
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      setError("Introdu emailul și parola pentru a intra în RabAI.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signIn({ email: email.trim(), password });
      router.replace("/engine" as any);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Autentificarea RabAI a eșuat. Încearcă din nou."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>R</Text>
          </View>
          <View>
            <Text style={styles.logo}>RabAI</Text>
            <Text style={styles.brandSubtitle}>Engine Access</Text>
          </View>
        </View>

        <Text style={styles.title}>Intră în RabAI</Text>
        <Text style={styles.subtitle}>Accesează motorul tău profesional.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={palette.muted}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Parola ta"
            placeholderTextColor={palette.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Se autentifică..." : "Login"}
          </Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.linkButton}
            onPress={() => {
              router.push("/role" as any);
            }}
          >
            <Text style={styles.linkButtonText}>Create account</Text>
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => {
              router.replace("/" as any);
            }}
          >
            <Text style={styles.linkButtonText}>Back</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: palette.page,
    flex: 1,
    justifyContent: "center",
    padding: Spacing.screen,
  },

  card: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    maxWidth: 520,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 36,
    width: "100%",
    elevation: 5,
  },

  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },

  brandMark: {
    alignItems: "center",
    backgroundColor: palette.violetDark,
    borderRadius: Radius.xl,
    height: 54,
    justifyContent: "center",
    width: 54,
  },

  brandMarkText: {
    color: Colors.white,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },

  logo: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },

  brandSubtitle: {
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginTop: Spacing.xs,
    textTransform: "uppercase",
  },

  title: {
    color: palette.ink,
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 34,
    marginBottom: Spacing.xl,
  },

  subtitle: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.five,
  },

  fieldGroup: {
    marginBottom: Spacing.xl,
  },

  label: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.sm,
  },

  input: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    fontSize: Typography.body,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },

  errorText: {
    backgroundColor: palette.redSoft,
    borderRadius: Radius.lg,
    color: palette.red,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.red,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.button,
    fontWeight: Typography.fontWeight.black,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xl,
    justifyContent: "center",
    marginTop: Spacing.three,
  },

  linkButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },

  linkButtonText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
});
