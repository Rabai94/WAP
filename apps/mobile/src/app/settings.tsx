import RequireAuth from "@/components/RequireAuth";
import { PageContainer, PageHeader, RabAICard } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { languages, type LanguageCode } from "@/i18n/translations";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

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
    <PageContainer
      contentStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      maxWidth="content"
      scroll
    >
      <PageHeader
        description={copy.subtitle}
        eyebrow="RabAI"
        title={copy.title}
      />

      <RabAICard
        description={copy.languageDescription}
        title={copy.languageTitle}
      >
        <View accessibilityRole="radiogroup" style={styles.languageList}>
          {languages.map((item) => {
            const selected = item.code === language;

            return (
              <RabAICard
                accessibilityLabel={item.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                interactive
                key={item.code}
                onPress={() => setLanguage(item.code)}
                padding="sm"
                selected={selected}
                style={styles.languageOption}
                variant="filled"
              >
                <View style={styles.languageRow}>
                  <View
                    accessibilityElementsHidden
                    style={[styles.radio, selected && styles.radioSelected]}
                  >
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.languageCopy}>
                    <Text style={styles.languageName}>{item.label}</Text>
                    <Text style={styles.languageMeta}>
                      {item.code.toUpperCase()}
                      {selected ? ` · ${copy.current}` : ""}
                    </Text>
                  </View>
                </View>
              </RabAICard>
            );
          })}
        </View>
      </RabAICard>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  languageList: {
    gap: Spacing.control,
  },
  languageOption: {
    minHeight: 64,
  },
  languageRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.inline,
    minWidth: 0,
  },
  radio: {
    alignItems: "center",
    borderColor: Colors.placeholder,
    borderRadius: Radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    height: 10,
    width: 10,
  },
  languageCopy: {
    flex: 1,
    minWidth: 0,
  },
  languageName: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  languageMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.small,
    marginTop: Spacing.compact,
  },
});
