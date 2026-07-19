import RequireAuth from "@/components/RequireAuth";
import { useLanguage } from "@/i18n/LanguageProvider";
import { languages, type LanguageCode } from "@/i18n/translations";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";

type SettingsCopy = {
  current: string;
  languageDescription: string;
  languageTitle: string;
  subtitle: string;
  title: string;
};

const copyByLanguage = {
  ro: {
    current: "Selectată",
    languageDescription:
      "Alege limba folosită în meniul RabAI și în ecranele care oferă traduceri.",
    languageTitle: "Limba interfeței",
    subtitle: "Personalizează modul în care folosești spațiul tău de lucru.",
    title: "Setări",
  },
  en: {
    current: "Selected",
    languageDescription:
      "Choose the language used in the RabAI menu and in screens that provide translations.",
    languageTitle: "Interface language",
    subtitle: "Personalize how you use your workspace.",
    title: "Settings",
  },
  de: {
    current: "Ausgewählt",
    languageDescription:
      "Wähle die Sprache für das RabAI-Menü und für Ansichten mit Übersetzungen.",
    languageTitle: "Sprache der Oberfläche",
    subtitle: "Passe deinen Arbeitsbereich an deine Nutzung an.",
    title: "Einstellungen",
  },
} satisfies Record<LanguageCode, SettingsCopy>;

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

export default function SettingsScreen() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
  const { language, setLanguage } = useLanguage();
  const copy = copyByLanguage[language];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>RabAI</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{copy.languageTitle}</Text>
          <Text style={styles.cardDescription}>{copy.languageDescription}</Text>

          <View accessibilityRole="radiogroup" style={styles.languageList}>
            {languages.map((item) => {
              const selected = item.code === language;

              return (
                <Pressable
                  accessibilityLabel={item.label}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={item.code}
                  onPress={() => setLanguage(item.code)}
                  style={({ hovered, pressed }) => [
                    styles.languageOption,
                    selected && styles.languageOptionSelected,
                    hovered && !selected && styles.languageOptionHovered,
                    pressed && styles.languageOptionPressed,
                    pointerWebStyle,
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      selected && styles.radioSelected,
                    ]}
                  >
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.languageCopy}>
                    <Text style={styles.languageName}>{item.label}</Text>
                    <Text style={styles.languageCode}>
                      {item.code.toUpperCase()}
                    </Text>
                  </View>
                  {selected ? (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>{copy.current}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    alignSelf: "center",
    gap: Spacing.screen,
    maxWidth: 920,
    padding: Spacing.eight,
    paddingBottom: 64,
    width: "100%",
  },
  header: {
    maxWidth: 680,
  },
  eyebrow: {
    color: Colors.brandDeep,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.7,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.text,
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
  },
  subtitle: {
    color: Colors.textSubtle,
    fontSize: Typography.body,
    lineHeight: 23,
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.screen,
    ...Shadows.card,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
  },
  cardDescription: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  languageList: {
    gap: Spacing.md,
    marginTop: Spacing.screen,
  },
  languageOption: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    minHeight: 64,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
  languageOptionSelected: {
    backgroundColor: Colors.brandSoft,
    borderColor: "rgba(20, 92, 255, 0.28)",
  },
  languageOptionHovered: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  languageOptionPressed: {
    opacity: 0.8,
  },
  radio: {
    alignItems: "center",
    borderColor: Colors.placeholder,
    borderRadius: Radius.round,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  radioSelected: {
    borderColor: Colors.brand,
  },
  radioDot: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.round,
    height: 10,
    width: 10,
  },
  languageCopy: {
    flex: 1,
    minWidth: 0,
  },
  languageName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  languageCode: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: Spacing.xs,
  },
  selectedBadge: {
    backgroundColor: Colors.surface,
    borderColor: "rgba(20, 92, 255, 0.18)",
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  selectedBadgeText: {
    color: Colors.brandDeep,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
