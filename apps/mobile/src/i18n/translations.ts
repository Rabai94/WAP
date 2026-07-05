export type LanguageCode = "de" | "en" | "ro";

export const languages: {
  code: LanguageCode;
  label: string;
}[] = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "ro", label: "Română" },
];

export const defaultLanguage: LanguageCode = "de";

export const translations: Record<LanguageCode, Record<string, string>> = {
  de: {
    "common.continue": "Weiter",
    "common.back": "Zurück",
    "common.save": "Speichern",
    "common.start": "Starten",
    "common.apply": "Bewerben",
    "common.confirm": "Bestätigen",

    "home.title": "WAP",
    "home.subtitle": "Deine Karriere beginnt hier",
    "home.description":
      "Eine Plattform für Arbeit, Unternehmen, Verträge und Zahlungen.",
    "home.start": "Starten",

    "home.card.jobs": "Jobs",
    "home.card.career": "Karriere",
    "home.card.services": "Services",
    "home.card.business": "Unternehmen",
    "home.card.ai": "Wapy AI",

    "role.title": "Wähle deine Rolle",
    "role.subtitle": "Wie möchtest du WAP nutzen?",
    "role.worker": "Ich bin Arbeiter",
    "role.business": "Ich bin Unternehmen",
  },

  en: {
    "common.continue": "Continue",
    "common.back": "Back",
    "common.save": "Save",
    "common.start": "Start",
    "common.apply": "Apply",
    "common.confirm": "Confirm",

    "home.title": "WAP",
    "home.subtitle": "Your career starts here",
    "home.description":
      "A platform for work, companies, contracts and payments.",
    "home.start": "Start",

    "home.card.jobs": "Jobs",
    "home.card.career": "Career",
    "home.card.services": "Services",
    "home.card.business": "Business",
    "home.card.ai": "Wapy AI",

    "role.title": "Choose your role",
    "role.subtitle": "How do you want to use WAP?",
    "role.worker": "I am a worker",
    "role.business": "I am a company",
  },

  ro: {
    "common.continue": "Continuă",
    "common.back": "Înapoi",
    "common.save": "Salvează",
    "common.start": "Începe",
    "common.apply": "Aplică",
    "common.confirm": "Confirmă",

    "home.title": "WAP",
    "home.subtitle": "Cariera ta începe aici",
    "home.description":
      "O platformă pentru muncă, firme, contracte și plăți.",
    "home.start": "Începe",

    "home.card.jobs": "Joburi",
    "home.card.career": "Carieră",
    "home.card.services": "Servicii",
    "home.card.business": "Firme",
    "home.card.ai": "Wapy AI",

    "role.title": "Alege rolul",
    "role.subtitle": "Cum vrei să folosești WAP?",
    "role.worker": "Sunt lucrător",
    "role.business": "Sunt firmă",
  },
};

export function translate(language: LanguageCode, key: string) {
  return translations[language][key] ?? translations.de[key] ?? key;
}