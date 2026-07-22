import RequireAuth from "@/components/RequireAuth";
import {
  ListingRow,
  PageContainer,
  PageHeader,
  Section,
  StatusBadge,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { languages, type LanguageCode } from "@/i18n/translations";
import { Spacing } from "@/theme";
import { StyleSheet, View } from "react-native";

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
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      <PageHeader description={copy.subtitle} title={copy.title} />
      <Section
        description={copy.languageDescription}
        title={copy.languageTitle}
      >
        <View accessibilityRole="radiogroup" style={styles.languageList}>
          {languages.map((item) => {
            const selected = item.code === language;

            return (
              <ListingRow
                accessibilityHint={copy.languageDescription}
                accessibilityLabel={`${item.label}, ${
                  selected ? copy.current : item.code.toUpperCase()
                }`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                actions={
                  selected ? (
                    <StatusBadge label={copy.current} status="active" />
                  ) : undefined
                }
                compact
                key={item.code}
                onPress={() => setLanguage(item.code)}
                selected={selected}
                subtitle={item.code.toUpperCase()}
                title={item.label}
              />
            );
          })}
        </View>
      </Section>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  languageList: {
    minWidth: 0,
  },
});
