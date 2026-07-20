import type { LanguageCode } from "@/i18n/translations";

export type OrganizationCopy = {
  aboutCompany: string;
  back: string;
  cancel: string;
  comingSoon: string;
  comingSoonFields: string;
  comingSoonTitle: string;
  complete: string;
  completeProfile: string;
  completionChecklist: string;
  completionSummary: (completed: number, total: number) => string;
  countryCodeError: string;
  createOrganization: string;
  editOrganization: string;
  editOrganizationTitle: string;
  exitPublicPreview: string;
  formLoading: string;
  formSubtitle: string;
  internalStatus: string;
  incomplete: string;
  invalidOrganization: string;
  loadFailedSaveDisabled: string;
  loadingProfile: string;
  notProvided: string;
  notSaved: string;
  openWebsite: string;
  organizationTypeUnavailable: string;
  ownedOrganization: string;
  ownerDashboard: string;
  ownerDashboardSubtitle: string;
  profileCompletion: string;
  publicDataNote: string;
  publicNotFound: string;
  publicPreview: string;
  publicPreviewNote: string;
  publicProfile: string;
  publicProfileSubtitle: string;
  publicationUnavailable: string;
  publishJob: string;
  retry: string;
  safeSavedFields: string;
  safeSavedFieldsText: string;
  saveChanges: string;
  saving: string;
  verificationUnavailable: string;
  viewApplications: string;
  viewOrganization: string;
  viewPublicProfile: string;
};

const copy: Record<LanguageCode, OrganizationCopy> = {
  de: {
    aboutCompany: "Über das Unternehmen",
    back: "Zurück",
    cancel: "Abbrechen",
    comingSoon: "Demnächst verfügbar",
    comingSoonFields:
      "Kontakt-E-Mail, Telefon, Registernummer, USt-IdNr. und Funktionen werden noch nicht gespeichert.",
    comingSoonTitle: "Für eine spätere Version",
    complete: "Vollständig",
    completeProfile: "Profil vervollständigen",
    completionChecklist: "Profil-Checkliste",
    completionSummary: (completed, total) =>
      `${completed} von ${total} gespeicherten Feldern vollständig`,
    countryCodeError: "Gib einen zweistelligen Ländercode ein, zum Beispiel DE.",
    createOrganization: "Organisation erstellen",
    editOrganization: "Organisation bearbeiten",
    editOrganizationTitle: "Organisation bearbeiten",
    exitPublicPreview: "Öffentliche Vorschau schließen",
    formLoading: "Gespeicherte Organisationsdaten werden geladen…",
    formSubtitle:
      "Nur die als gespeichert markierten Felder werden an das bestehende Backend gesendet.",
    internalStatus: "Interner Status",
    incomplete: "Unvollständig",
    invalidOrganization: "Die Organisationsadresse ist ungültig.",
    loadFailedSaveDisabled:
      "Speichern bleibt deaktiviert, bis die bestehenden Daten sicher geladen wurden.",
    loadingProfile: "Organisationsprofil wird geladen…",
    notProvided: "Nicht angegeben",
    notSaved: "Wird nicht gespeichert",
    openWebsite: "Website öffnen",
    organizationTypeUnavailable:
      "Akademien und Institutionen können mit dem aktuellen Datenmodell noch nicht gespeichert werden.",
    ownedOrganization: "Deine Organisation",
    ownerDashboard: "Organisation verwalten",
    ownerDashboardSubtitle:
      "Interne Informationen und Aktionen sind nur für den Eigentümer sichtbar.",
    profileCompletion: "Profilvollständigkeit",
    publicDataNote: "Dieser Bereich enthält nur sichere öffentliche Profildaten.",
    publicNotFound:
      "Dieses öffentliche Organisationsprofil ist nicht verfügbar.",
    publicPreview: "Öffentliche Vorschau",
    publicPreviewNote:
      "Die Vorschau enthält nur öffentlich vorgesehene Felder. Die Sichtbarkeit für Besucher hängt von Status und Verifizierung ab.",
    publicProfile: "Öffentliches Profil",
    publicProfileSubtitle:
      "Verifizierte Organisationsinformationen für Besucher und Bewerbende.",
    publicationUnavailable:
      "Jobveröffentlichung erfordert eine aktive und verifizierte Organisation.",
    publishJob: "Job veröffentlichen",
    retry: "Erneut versuchen",
    safeSavedFields: "Gespeicherte Felder",
    safeSavedFieldsText:
      "Name, rechtlicher Name, Land, Stadt, Postleitzahl, Adresse, Website, Branche, Größe und Beschreibung werden gespeichert.",
    saveChanges: "Änderungen speichern",
    saving: "Wird gespeichert…",
    verificationUnavailable:
      "Eine eigene Route für die Organisationsprüfung ist noch nicht verfügbar.",
    viewApplications: "Bewerbungen ansehen",
    viewOrganization: "Organisation ansehen",
    viewPublicProfile: "Öffentliches Profil ansehen",
  },
  en: {
    aboutCompany: "About the company",
    back: "Back",
    cancel: "Cancel",
    comingSoon: "Available soon",
    comingSoonFields:
      "Contact email, phone, registration number, VAT ID, and capabilities are not saved yet.",
    comingSoonTitle: "Planned for a later version",
    complete: "Complete",
    completeProfile: "Complete profile",
    completionChecklist: "Profile checklist",
    completionSummary: (completed, total) =>
      `${completed} of ${total} saved fields complete`,
    countryCodeError: "Enter a two-letter country code, for example DE.",
    createOrganization: "Create organization",
    editOrganization: "Edit organization",
    editOrganizationTitle: "Edit organization",
    exitPublicPreview: "Exit public preview",
    formLoading: "Loading saved organization data…",
    formSubtitle:
      "Only fields marked as saved are sent to the existing backend.",
    internalStatus: "Internal status",
    incomplete: "Incomplete",
    invalidOrganization: "The organization address is invalid.",
    loadFailedSaveDisabled:
      "Saving stays disabled until existing data is loaded safely.",
    loadingProfile: "Loading organization profile…",
    notProvided: "Not provided",
    notSaved: "Not saved",
    openWebsite: "Open website",
    organizationTypeUnavailable:
      "Academies and institutions cannot be saved with the current data model yet.",
    ownedOrganization: "Your organization",
    ownerDashboard: "Organization administration",
    ownerDashboardSubtitle:
      "Internal information and actions are visible only to the owner.",
    profileCompletion: "Profile completion",
    publicDataNote: "This section contains safe public profile data only.",
    publicNotFound: "This public organization profile is not available.",
    publicPreview: "Public preview",
    publicPreviewNote:
      "This preview contains public-safe fields only. Visitor access still depends on status and verification.",
    publicProfile: "Public profile",
    publicProfileSubtitle:
      "Verified organization information for visitors and applicants.",
    publicationUnavailable:
      "Publishing a job requires an active and verified organization.",
    publishJob: "Publish job",
    retry: "Try again",
    safeSavedFields: "Saved fields",
    safeSavedFieldsText:
      "Name, legal name, country, city, postal code, address, website, industry, size, and description are saved.",
    saveChanges: "Save changes",
    saving: "Saving…",
    verificationUnavailable:
      "A dedicated organization verification route is not available yet.",
    viewApplications: "View applications",
    viewOrganization: "View organization",
    viewPublicProfile: "View public profile",
  },
  ro: {
    aboutCompany: "Despre companie",
    back: "Înapoi",
    cancel: "Anulează",
    comingSoon: "Disponibil în curând",
    comingSoonFields:
      "Emailul de contact, telefonul, numărul de înregistrare, VAT ID și capabilitățile nu se salvează încă.",
    comingSoonTitle: "Planificat pentru o versiune viitoare",
    complete: "Complet",
    completeProfile: "Completează profilul",
    completionChecklist: "Checklist profil",
    completionSummary: (completed, total) =>
      `${completed} din ${total} câmpuri salvate sunt complete`,
    countryCodeError: "Introdu un cod de țară din două litere, de exemplu DE.",
    createOrganization: "Creează organizația",
    editOrganization: "Editează organizația",
    editOrganizationTitle: "Editează organizația",
    exitPublicPreview: "Închide previzualizarea publică",
    formLoading: "Se încarcă datele salvate ale organizației…",
    formSubtitle:
      "Doar câmpurile marcate ca salvate sunt trimise către backend-ul existent.",
    internalStatus: "Status intern",
    incomplete: "Incomplet",
    invalidOrganization: "Adresa organizației nu este validă.",
    loadFailedSaveDisabled:
      "Salvarea rămâne dezactivată până când datele existente sunt încărcate în siguranță.",
    loadingProfile: "Se încarcă profilul organizației…",
    notProvided: "Nespecificat",
    notSaved: "Nu se salvează",
    openWebsite: "Deschide website-ul",
    organizationTypeUnavailable:
      "Academiile și instituțiile nu pot fi salvate încă prin modelul de date actual.",
    ownedOrganization: "Organizația ta",
    ownerDashboard: "Administrarea organizației",
    ownerDashboardSubtitle:
      "Informațiile și acțiunile interne sunt vizibile numai proprietarului.",
    profileCompletion: "Completitudinea profilului",
    publicDataNote: "Această zonă conține numai date publice sigure.",
    publicNotFound: "Acest profil public de organizație nu este disponibil.",
    publicPreview: "Previzualizare publică",
    publicPreviewNote:
      "Previzualizarea conține numai câmpurile publice sigure. Accesul vizitatorilor depinde în continuare de status și verificare.",
    publicProfile: "Profil public",
    publicProfileSubtitle:
      "Informații verificate despre organizație pentru vizitatori și candidați.",
    publicationUnavailable:
      "Publicarea unui job necesită o organizație activă și verificată.",
    publishJob: "Publică job",
    retry: "Încearcă din nou",
    safeSavedFields: "Câmpuri salvate",
    safeSavedFieldsText:
      "Numele, denumirea legală, țara, orașul, codul poștal, adresa, website-ul, industria, mărimea și descrierea se salvează.",
    saveChanges: "Salvează modificările",
    saving: "Se salvează…",
    verificationUnavailable:
      "O rută dedicată verificării organizației nu este încă disponibilă.",
    viewApplications: "Vezi aplicările",
    viewOrganization: "Vezi organizația",
    viewPublicProfile: "Vezi profilul public",
  },
};

export function getOrganizationCopy(language: LanguageCode) {
  return copy[language];
}
