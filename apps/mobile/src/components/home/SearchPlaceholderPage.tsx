import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type SearchPlaceholderPageProps = {
  title: string;
};

function formatParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value?.trim() || "Necompletat";
}

export default function SearchPlaceholderPage({
  title,
}: SearchPlaceholderPageProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    search?: string | string[];
    location?: string | string[];
  }>();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.replace("/" as never);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Acasă</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>În curând</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Această secțiune este pregătită pentru dezvoltare ulterioară.
          </Text>

          <View style={styles.paramsCard}>
            <Text style={styles.paramsTitle}>Parametri primiți</Text>
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Căutare</Text>
              <Text style={styles.paramValue}>{formatParam(params.search)}</Text>
            </View>
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Locație</Text>
              <Text style={styles.paramValue}>{formatParam(params.location)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F7FAFF",
    flex: 1,
  },
  content: {
    alignSelf: "center",
    maxWidth: 960,
    padding: Spacing.four,
    width: "100%",
  },
  header: {
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderColor: "#DDE7F8",
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    color: "#145CFF",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  card: {
    backgroundColor: Colors.white,
    borderColor: "#DDE7F8",
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.four,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 2,
  },
  eyebrow: {
    color: "#6E1DFF",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#0A1028",
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: "#66708A",
    fontSize: Typography.body,
    lineHeight: 24,
    marginTop: Spacing.md,
  },
  paramsCard: {
    backgroundColor: "#F3F7FF",
    borderColor: "#E3EBFA",
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.four,
    padding: Spacing.lg,
  },
  paramsTitle: {
    color: "#0A1028",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },
  paramRow: {
    borderTopColor: "#DDE7F8",
    borderTopWidth: 1,
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  paramLabel: {
    color: "#66708A",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  paramValue: {
    color: "#17213F",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
});
