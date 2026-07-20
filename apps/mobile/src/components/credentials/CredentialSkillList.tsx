import type { LanguageCode } from "@/i18n/translations";
import type { CredentialSkill } from "@/services/credentials/credentialService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

type CredentialSkillListProps = {
  emptyLabel: string;
  language: LanguageCode;
  skills: CredentialSkill[];
};

export default function CredentialSkillList({
  emptyLabel,
  language,
  skills,
}: CredentialSkillListProps) {
  if (skills.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.list}>
      {skills.map((skill) => (
        <View key={skill.slug} style={styles.chip}>
          <Text style={styles.chipText}>{skill[`name_${language}`]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.brandSoft,
    borderColor: "#BFD2FF",
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  chipText: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
  },
});
