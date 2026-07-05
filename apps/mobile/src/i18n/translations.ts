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
    "common.apply": "Bewerben",
    "common.back": "Zurück",
    "common.backToActiveJob": "Zurück zum aktiven Job",
    "common.backToApplications": "Zurück zu Bewerbungen",
    "common.backToBusinessDashboard": "Zurück zum Firmendashboard",
    "common.backToCheckIn": "Zurück zum Check-in",
    "common.backToCheckOut": "Zurück zum Check-out",
    "common.backToContract": "Zurück zum Vertrag",
    "common.backToDashboard": "Zurück zum Dashboard",
    "common.backToForm": "Zurück zum Formular",
    "common.backToJob": "Zurück zum Job",
    "common.backToJobs": "Zurück zu Jobs",
    "common.backToPayment": "Zurück zur Zahlung",
    "common.backToStart": "Zurück zum Anfang",
    "common.business": "Firma",
    "common.city": "Stadt",
    "common.company": "Firma",
    "common.confirm": "Bestätigen",
    "common.continue": "Weiter",
    "common.dashboardBusiness": "Firmendashboard",
    "common.dashboardWorker": "Arbeiterdashboard",
    "common.job": "Job",
    "common.location": "Standort",
    "common.nextSteps": "Nächste Schritte",
    "common.pay": "Bezahlung",
    "common.payPerHour": "Bezahlung/Stunde",
    "common.save": "Speichern",
    "common.status": "Status",
    "common.start": "Starten",
    "common.startTime": "Start",
    "common.worker": "Arbeiter",
    "demo.amount.businessFee": "4 €",
    "demo.amount.grossTotal": "120 €",
    "demo.amount.pay15": "15 €",
    "demo.amount.workerTotal": "116 €",
    "demo.city.augsburg": "Augsburg",
    "demo.city.munich": "München",
    "demo.company.wapLogistics": "WAP Logistics GmbH",
    "demo.hours.eight": "8",
    "demo.pay14PerHour": "14 €/Std.",
    "demo.pay15PerHour": "15 €/Std.",
    "demo.worker.ion": "Ion Popescu",
    "demo.worker.maria": "Maria Ionescu",

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

    "chooseRole.title": "Wähle deine Rolle",
    "chooseRole.subtitle": "Wie möchtest du WAP nutzen?",
    "chooseRole.workerTitle": "Ich bin Arbeiter",
    "chooseRole.workerDescription":
      "Ich suche Arbeit, kurze Jobs oder legale Verträge.",
    "chooseRole.businessTitle": "Ich bin Unternehmen",
    "chooseRole.businessDescription":
      "Ich möchte geprüfte Menschen für Arbeit finden.",

    "welcome.title": "WAP",
    "welcome.subtitle": "Baue deine Zukunft.",
    "welcome.description":
      "Ein Ökosystem für Karrieren, Services, Unternehmen und Chancen.",
    "welcome.start": "Loslegen",

    "worker.title": "Arbeiterprofil",
    "worker.subtitle":
      "Erstelle dein Profil, damit Unternehmen dich finden und dir passende Jobs anbieten können.",
    "worker.card.title": "Was du als Nächstes machst",
    "worker.card.item1": "Persönliche Daten hinzufügen",
    "worker.card.item2": "Arbeitsbereich auswählen",
    "worker.card.item3": "Verfügbarkeit festlegen",
    "worker.card.item4": "Passende Jobs ansehen",
    "worker.continue": "Profil erstellen",

    "business.title": "Unternehmensprofil",
    "business.subtitle":
      "Erstelle dein Unternehmensprofil, veröffentliche Jobs und verwalte Bewerbungen.",
    "business.card.title": "Was dein Unternehmen machen kann",
    "business.card.item1": "Unternehmensdaten hinzufügen",
    "business.card.item2": "Jobangebote veröffentlichen",
    "business.card.item3": "Bewerbungen ansehen",
    "business.card.item4": "Verträge und Zahlungen verwalten",
    "business.continue": "Unternehmen einrichten",

    "workerForm.title": "Arbeiterdaten",
    "workerForm.subtitle":
      "Fülle die wichtigsten Informationen aus, damit Unternehmen dein Profil besser einschätzen können.",
    "workerForm.name": "Vollständiger Name",
    "workerForm.namePlaceholder": "z. B. Ion Popescu",
    "workerForm.city": "Stadt",
    "workerForm.cityPlaceholder": "z. B. Augsburg",
    "workerForm.workType": "Arbeitsbereich",
    "workerForm.workTypePlaceholder": "z. B. Lager, Reinigung, Fahrer",
    "workerForm.availability": "Verfügbarkeit",
    "workerForm.availabilityPlaceholder": "z. B. Montag bis Freitag",
    "workerForm.save": "Profil speichern",

    "businessForm.title": "Unternehmensdaten",
    "businessForm.subtitle":
      "Füge die wichtigsten Unternehmensdaten hinzu, um Jobs veröffentlichen zu können.",
    "businessForm.companyName": "Unternehmensname",
    "businessForm.companyNamePlaceholder": "z. B. WAP Logistics GmbH",
    "businessForm.city": "Stadt",
    "businessForm.cityPlaceholder": "z. B. München",
    "businessForm.workType": "Arbeitsbereich",
    "businessForm.workTypePlaceholder": "z. B. Lager, Reinigung, Lieferung",
    "businessForm.workersNeeded": "Benötigte Arbeiter",
    "businessForm.workersNeededPlaceholder": "z. B. 5",
    "businessForm.save": "Unternehmen speichern",

    "workerDashboard.title": "Arbeiterdashboard",
    "workerDashboard.subtitle":
      "Dein Profil wurde erstellt. Hier siehst du verfügbare Jobs.",
    "workerDashboard.item1": "Identität prüfen",
    "workerDashboard.item2": "Arbeitsarten auswählen",
    "workerDashboard.item3": "Verfügbarkeit festlegen",
    "workerDashboard.item4": "Jobangebote erhalten",
    "workerDashboard.jobsTitle": "Empfohlene Jobs",
    "workerDashboard.empty":
      "Demo-Jobs sind verfügbar. Öffne die Jobliste, um dich zu bewerben.",
    "workerDashboard.viewJobs": "Jobs ansehen",

    "businessDashboard.title": "Firmendashboard",
    "businessDashboard.subtitle":
      "Das Firmenprofil wurde erstellt. Hier verwaltest du Jobs und Arbeiter.",
    "businessDashboard.item1": "Firma prüfen",
    "businessDashboard.item2": "Ersten Job erstellen",
    "businessDashboard.item3": "Arbeiter auswählen",
    "businessDashboard.item4": "Vertrag und Zahlung in der App",
    "businessDashboard.jobsTitle": "Veröffentlichte Jobs",
    "businessDashboard.empty":
      "Die Firma hat noch keine echten Jobs gespeichert. Es gibt nur einen Demo-Flow für das MVP.",
    "businessDashboard.createJob": "Job erstellen",
    "businessDashboard.viewApplications": "Bewerbungen ansehen",

    "jobs.title": "Verfügbare Jobs",
    "jobs.subtitle":
      "Hier sieht der Arbeiter Jobs, die von Firmen veröffentlicht wurden.",
    "jobs.warehouseTitle": "Lagerarbeiter",
    "jobs.warehousePeople": "👥 4 Personen gesucht",
    "jobs.warehouseDescription":
      "Pakete sortieren, Lagerarbeit, flexibler Zeitplan.",
    "jobs.cleaningTitle": "Büroreinigung",
    "jobs.cleaningPeople": "👥 2 Personen gesucht",
    "jobs.cleaningDescription":
      "Büroreinigung am Abend, legaler Vertrag über die App.",

    "applicationSent.title": "Bewerbung gesendet",
    "applicationSent.subtitle":
      "Du hast dich für den Job beworben. Die Firma sieht dein Profil und kann dich auswählen.",
    "applicationSent.cardTitle": "Was passiert als Nächstes?",
    "applicationSent.item1": "Die Firma erhält deine Bewerbung",
    "applicationSent.item2": "Dein Profil kann geprüft werden",
    "applicationSent.item3":
      "Wenn du akzeptiert wirst, folgt der Vertrag",
    "applicationSent.item4": "Die Zahlung wird über die App organisiert",

    "applications.title": "Erhaltene Bewerbungen",
    "applications.subtitle":
      "Hier sieht die Firma Arbeiter, die sich auf Jobs beworben haben.",
    "applications.appliedTo": "Beworben auf",
    "applications.availability": "Verfügbarkeit",
    "applications.pending": "In Prüfung",
    "applications.accept": "Akzeptieren",
    "applications.reject": "Ablehnen",
    "applications.ionAvailability": "Wochenende und Abend",
    "applications.mariaAvailability": "Montag bis Freitag abends",

    "createJob.title": "Job erstellen",
    "createJob.subtitle":
      "Fülle die Details des Jobs aus, den du veröffentlichen möchtest.",
    "createJob.jobTitle": "Jobtitel",
    "createJob.jobTitlePlaceholder": "z. B. Lagerarbeiter",
    "createJob.cityPlaceholder": "z. B. Augsburg",
    "createJob.payPerHour": "Bezahlung pro Stunde",
    "createJob.payPlaceholder": "z. B. 15",
    "createJob.workersNeeded": "Wie viele Personen suchst du?",
    "createJob.workersPlaceholder": "z. B. 4",
    "createJob.description": "Jobbeschreibung",
    "createJob.descriptionPlaceholder":
      "z. B. Lagerarbeit, Pakete sortieren, flexibler Zeitplan.",
    "createJob.publish": "Job veröffentlichen",

    "jobPublished.title": "Job veröffentlicht",
    "jobPublished.subtitle":
      "Dein Job wurde erfolgreich erstellt. Jetzt kann er von Arbeitern gesehen werden.",
    "jobPublished.item1": "Der Job erscheint in der Jobliste",
    "jobPublished.item2": "Arbeiter können sich bewerben",
    "jobPublished.item3": "Die Firma kann Kandidaten auswählen",
    "jobPublished.item4": "Der Vertrag wird in der App generiert",

    "workerAccepted.title": "Arbeiter akzeptiert",
    "workerAccepted.subtitle":
      "Die Firma hat den Arbeiter akzeptiert. Der nächste Schritt ist die Vertragserstellung.",
    "workerAccepted.item1": "Identität des Arbeiters bestätigen",
    "workerAccepted.item2": "Firmendaten bestätigen",
    "workerAccepted.item3": "Legalvertrag generieren",
    "workerAccepted.item4": "Zeit, Ort und Bezahlung festlegen",
    "workerAccepted.generateContract": "Vertrag generieren",

    "contract.title": "Vertrag generiert",
    "contract.subtitle":
      "Der Demo-Vertrag wurde zur Unterzeichnung vorbereitet.",
    "contract.details": "Vertragsdetails",
    "contract.readyStatus": "Bereit zur Unterzeichnung",
    "contract.noteTitle": "MVP-Hinweis",
    "contract.noteText":
      "Dies ist nur ein Demo-Vertrag für die App. Echte Verträge müssen vor der Nutzung rechtlich geprüft werden.",
    "contract.send": "Zur Unterzeichnung senden",

    "contractSent.title": "Vertrag gesendet",
    "contractSent.subtitle":
      "Der Vertrag wurde zur Unterzeichnung an Firma und Arbeiter gesendet.",
    "contractSent.signStatus": "Signaturstatus",
    "contractSent.item1": "Vertrag generiert",
    "contractSent.item2": "An die Firma gesendet",
    "contractSent.item3": "An den Arbeiter gesendet",
    "contractSent.pending": "Wartet auf Signaturen",
    "contractSent.afterTitle": "Nach der Unterzeichnung",
    "contractSent.after1": "Der Job wird aktiv",
    "contractSent.after2": "Der Arbeiter kann anfangen",
    "contractSent.after3": "Die Zahlung wird in der App verfolgt",
    "contractSent.simulate": "Vollständige Signatur simulieren",

    "jobActive.title": "Job aktiv",
    "jobActive.subtitle":
      "Der Vertrag wurde unterschrieben. Der Arbeiter kann die Arbeit beginnen.",
    "jobActive.details": "Jobdetails",
    "jobActive.active": "Aktiv",
    "jobActive.nextTitle": "Nächster Schritt",
    "jobActive.item1": "Der Arbeiter kommt am Standort an",
    "jobActive.item2": "Er macht Check-in in der App",
    "jobActive.item3": "Die Arbeitszeit wird verfolgt",
    "jobActive.item4": "Die Zahlung wird nach Stunden berechnet",
    "jobActive.checkIn": "Arbeiter Check-in",

    "checkIn.title": "Check-in erledigt",
    "checkIn.subtitle":
      "Der Arbeiter hat die Arbeit begonnen. Die Startzeit wurde erfasst.",
    "checkIn.timeTitle": "Arbeitszeit",
    "checkIn.startNow": "jetzt",
    "checkIn.inProgress": "In Arbeit",
    "checkIn.item1": "Der Arbeiter arbeitet",
    "checkIn.item2": "Die Zeit wird verfolgt",
    "checkIn.item3": "Am Ende macht er Check-out",
    "checkIn.item4": "Die Zahlung wird nach Stunden berechnet",
    "checkIn.checkOut": "Arbeiter Check-out",

    "checkOut.title": "Check-out erledigt",
    "checkOut.subtitle":
      "Die Arbeit wurde beendet. Die gearbeiteten Stunden wurden berechnet.",
    "checkOut.summary": "Arbeitszusammenfassung",
    "checkOut.hours": "Gearbeitete Stunden",
    "checkOut.estimatedPay": "Geschätzte Zahlung",
    "checkOut.item1": "Die Firma bestätigt die Stunden",
    "checkOut.item2": "Die Zahlung wird vorbereitet",
    "checkOut.item3": "Der Arbeiter erhält das Geld",
    "checkOut.item4": "Beide Seiten können bewerten",
    "checkOut.continuePayment": "Weiter zur Zahlung",

    "payment.title": "Zahlung vorbereitet",
    "payment.subtitle":
      "Die Stunden wurden berechnet. Die Zahlung ist zur Verarbeitung vorbereitet.",
    "payment.calculation": "Zahlungsberechnung",
    "payment.grossTotal": "Bruttosumme",
    "payment.workerFee": "WAP-Gebühr Arbeiter",
    "payment.businessFee": "WAP-Gebühr Firma",
    "payment.workerTotal": "Geschätzte Summe für Arbeiter",
    "payment.statusTitle": "Zahlungsstatus",
    "payment.item1": "Stunden berechnet",
    "payment.item2": "WAP-Gebühren berechnet",
    "payment.item3": "Zahlung vorbereitet",
    "payment.pending": "Wartet auf Bestätigung der Firma",
    "payment.confirm": "Zahlung bestätigen",

    "paymentConfirmed.title": "Zahlung bestätigt",
    "paymentConfirmed.subtitle":
      "Die Firma hat Stunden und Zahlung bestätigt. Der Arbeiter erhält sein Geld.",
    "paymentConfirmed.summary": "Endzusammenfassung",
    "paymentConfirmed.workerPay": "Zahlung an Arbeiter",
    "paymentConfirmed.statusTitle": "Status",
    "paymentConfirmed.item1": "Die Arbeit wurde abgeschlossen",
    "paymentConfirmed.item2": "Die Stunden wurden bestätigt",
    "paymentConfirmed.item3": "Die Zahlung wurde bestätigt",
    "paymentConfirmed.success": "Job erfolgreich abgeschlossen",
    "paymentConfirmed.continueRating": "Weiter zur Bewertung",

    "rating.title": "Abschlussbewertung",
    "rating.subtitle":
      "Der Job wurde abgeschlossen. Jetzt können beide Seiten die Zusammenarbeit bewerten.",
    "rating.workerTitle": "Arbeiter bewerten",
    "rating.workerItem1": "Gute Pünktlichkeit",
    "rating.workerItem2": "Arbeit abgeschlossen",
    "rating.workerItem3": "Professionelles Verhalten",
    "rating.businessTitle": "Firma bewerten",
    "rating.businessItem1": "Seriöse Firma",
    "rating.businessItem2": "Zahlung bestätigt",
    "rating.businessItem3": "Vertrag eingehalten",
    "rating.finish": "Job abschließen",

    "jobCompleted.title": "Job abgeschlossen",
    "jobCompleted.subtitle":
      "Der Job wurde vollständig abgeschlossen. Vertrag, Zahlung und Bewertung wurden verarbeitet.",
    "jobCompleted.summary": "Endzusammenfassung",
    "jobCompleted.item1": "Job veröffentlicht",
    "jobCompleted.item2": "Arbeiter akzeptiert",
    "jobCompleted.item3": "Vertrag generiert und gesendet",
    "jobCompleted.item4": "Check-in und Check-out erledigt",
    "jobCompleted.item5": "Zahlung bestätigt",
    "jobCompleted.item6": "Bewertung abgeschlossen",
    "jobCompleted.mvpTitle": "WAP MVP Status",
    "jobCompleted.mvp1": "Der Hauptflow funktioniert.",
    "jobCompleted.mvp2": "Nächster realer Schritt: Daten speichern und Backend.",

    "explore.title": "Entdecken",
    "explore.subtitle":
      "Diese Starter-App enthält Beispielcode, der beim Einstieg hilft.",
    "explore.docs": "Expo-Dokumentation",
    "explore.routing": "Dateibasierte Navigation",
    "explore.routingText1":
      "Diese App hat zwei Beispielseiten: src/app/index.tsx und src/app/explore.tsx.",
    "explore.routingText2":
      "Die Layout-Datei in src/app/_layout.tsx richtet den Navigator ein.",
    "explore.learnMore": "Mehr erfahren",
    "explore.platforms": "Android-, iOS- und Web-Unterstützung",
    "explore.platformsText":
      "Du kannst dieses Projekt auf Android, iOS und im Web öffnen. Drücke w im Terminal, um die Web-Version zu öffnen.",
    "explore.images": "Bilder",
    "explore.imagesText":
      "Für statische Bilder kannst du @2x- und @3x-Suffixe verwenden, um Dateien für unterschiedliche Pixeldichten bereitzustellen.",
    "explore.theme": "Hell- und Dunkelmodus-Komponenten",
    "explore.themeText":
      "Diese Vorlage unterstützt Hell- und Dunkelmodus. Der useColorScheme()-Hook zeigt das aktuelle Farbschema des Nutzers.",
    "explore.animations": "Animationen",
    "explore.animationsText":
      "Diese Vorlage enthält ein Beispiel für eine animierte Komponente. src/components/ui/collapsible.tsx nutzt react-native-reanimated.",
  },

  en: {
    "common.apply": "Apply",
    "common.back": "Back",
    "common.backToActiveJob": "Back to active job",
    "common.backToApplications": "Back to applications",
    "common.backToBusinessDashboard": "Back to company dashboard",
    "common.backToCheckIn": "Back to check-in",
    "common.backToCheckOut": "Back to check-out",
    "common.backToContract": "Back to contract",
    "common.backToDashboard": "Back to dashboard",
    "common.backToForm": "Back to form",
    "common.backToJob": "Back to job",
    "common.backToJobs": "Back to jobs",
    "common.backToPayment": "Back to payment",
    "common.backToStart": "Back to start",
    "common.business": "Company",
    "common.city": "City",
    "common.company": "Company",
    "common.confirm": "Confirm",
    "common.continue": "Continue",
    "common.dashboardBusiness": "Company dashboard",
    "common.dashboardWorker": "Worker dashboard",
    "common.job": "Job",
    "common.location": "Location",
    "common.nextSteps": "Next steps",
    "common.pay": "Pay",
    "common.payPerHour": "Pay/hour",
    "common.save": "Save",
    "common.status": "Status",
    "common.start": "Start",
    "common.startTime": "Start",
    "common.worker": "Worker",
    "demo.amount.businessFee": "4 €",
    "demo.amount.grossTotal": "120 €",
    "demo.amount.pay15": "15 €",
    "demo.amount.workerTotal": "116 €",
    "demo.city.augsburg": "Augsburg",
    "demo.city.munich": "Munich",
    "demo.company.wapLogistics": "WAP Logistics GmbH",
    "demo.hours.eight": "8",
    "demo.pay14PerHour": "14 €/hour",
    "demo.pay15PerHour": "15 €/hour",
    "demo.worker.ion": "Ion Popescu",
    "demo.worker.maria": "Maria Ionescu",

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

    "chooseRole.title": "Choose your role",
    "chooseRole.subtitle": "How do you want to use WAP?",
    "chooseRole.workerTitle": "I am a worker",
    "chooseRole.workerDescription":
      "I am looking for work, short jobs or legal contracts.",
    "chooseRole.businessTitle": "I am a company",
    "chooseRole.businessDescription":
      "I want to find verified people for work.",

    "welcome.title": "WAP",
    "welcome.subtitle": "Build your future.",
    "welcome.description":
      "One ecosystem for careers, services, companies and opportunities.",
    "welcome.start": "Get Started",

    "worker.title": "Worker profile",
    "worker.subtitle":
      "Create your profile so companies can find you and offer you suitable jobs.",
    "worker.card.title": "What you do next",
    "worker.card.item1": "Add personal details",
    "worker.card.item2": "Choose your work area",
    "worker.card.item3": "Set your availability",
    "worker.card.item4": "View suitable jobs",
    "worker.continue": "Create profile",

    "business.title": "Company profile",
    "business.subtitle":
      "Create your company profile, publish jobs and manage applications.",
    "business.card.title": "What your company can do",
    "business.card.item1": "Add company details",
    "business.card.item2": "Publish job offers",
    "business.card.item3": "View applications",
    "business.card.item4": "Manage contracts and payments",
    "business.continue": "Set up company",

    "workerForm.title": "Worker details",
    "workerForm.subtitle":
      "Fill in the most important information so companies can understand your profile better.",
    "workerForm.name": "Full name",
    "workerForm.namePlaceholder": "e.g. John Smith",
    "workerForm.city": "City",
    "workerForm.cityPlaceholder": "e.g. Augsburg",
    "workerForm.workType": "Work area",
    "workerForm.workTypePlaceholder": "e.g. warehouse, cleaning, driver",
    "workerForm.availability": "Availability",
    "workerForm.availabilityPlaceholder": "e.g. Monday to Friday",
    "workerForm.save": "Save profile",

    "businessForm.title": "Company details",
    "businessForm.subtitle":
      "Add the most important company details so you can publish jobs.",
    "businessForm.companyName": "Company name",
    "businessForm.companyNamePlaceholder": "e.g. WAP Logistics GmbH",
    "businessForm.city": "City",
    "businessForm.cityPlaceholder": "e.g. Munich",
    "businessForm.workType": "Work area",
    "businessForm.workTypePlaceholder": "e.g. warehouse, cleaning, delivery",
    "businessForm.workersNeeded": "Workers needed",
    "businessForm.workersNeededPlaceholder": "e.g. 5",
    "businessForm.save": "Save company",

    "workerDashboard.title": "Worker dashboard",
    "workerDashboard.subtitle":
      "Your profile has been created. Here you will see available jobs.",
    "workerDashboard.item1": "Identity verification",
    "workerDashboard.item2": "Choose work types",
    "workerDashboard.item3": "Set availability",
    "workerDashboard.item4": "Receive job offers",
    "workerDashboard.jobsTitle": "Recommended jobs",
    "workerDashboard.empty":
      "Demo jobs are available. Open the job list to apply.",
    "workerDashboard.viewJobs": "View jobs",

    "businessDashboard.title": "Company dashboard",
    "businessDashboard.subtitle":
      "The company profile has been created. Here you will manage jobs and workers.",
    "businessDashboard.item1": "Company verification",
    "businessDashboard.item2": "Create the first job",
    "businessDashboard.item3": "Select workers",
    "businessDashboard.item4": "Contract and payment in the app",
    "businessDashboard.jobsTitle": "Posted jobs",
    "businessDashboard.empty":
      "The company has no real saved jobs yet. There is only a demo flow for the MVP.",
    "businessDashboard.createJob": "Create job",
    "businessDashboard.viewApplications": "View applications",

    "jobs.title": "Available jobs",
    "jobs.subtitle":
      "Here the worker will see jobs published by companies.",
    "jobs.warehouseTitle": "Warehouse worker",
    "jobs.warehousePeople": "👥 4 people needed",
    "jobs.warehouseDescription":
      "Package sorting, warehouse work, flexible schedule.",
    "jobs.cleaningTitle": "Office cleaning",
    "jobs.cleaningPeople": "👥 2 people needed",
    "jobs.cleaningDescription":
      "Office cleaning in the evening, legal contract through the app.",

    "applicationSent.title": "Application sent",
    "applicationSent.subtitle":
      "You applied for the job. The company will see your profile and can select you.",
    "applicationSent.cardTitle": "What happens next?",
    "applicationSent.item1": "The company receives your application",
    "applicationSent.item2": "Your profile can be verified",
    "applicationSent.item3": "If you are accepted, the contract follows",
    "applicationSent.item4": "Payment will be organized through the app",

    "applications.title": "Received applications",
    "applications.subtitle":
      "Here the company sees workers who applied to jobs.",
    "applications.appliedTo": "Applied to",
    "applications.availability": "Availability",
    "applications.pending": "Pending",
    "applications.accept": "Accept",
    "applications.reject": "Reject",
    "applications.ionAvailability": "Weekend and evening",
    "applications.mariaAvailability": "Monday to Friday evening",

    "createJob.title": "Create job",
    "createJob.subtitle":
      "Fill in the details of the job you want to publish.",
    "createJob.jobTitle": "Job title",
    "createJob.jobTitlePlaceholder": "e.g. Warehouse worker",
    "createJob.cityPlaceholder": "e.g. Augsburg",
    "createJob.payPerHour": "Pay per hour",
    "createJob.payPlaceholder": "e.g. 15",
    "createJob.workersNeeded": "How many people do you need?",
    "createJob.workersPlaceholder": "e.g. 4",
    "createJob.description": "Job description",
    "createJob.descriptionPlaceholder":
      "e.g. Warehouse work, package sorting, flexible schedule.",
    "createJob.publish": "Publish job",

    "jobPublished.title": "Job published",
    "jobPublished.subtitle":
      "Your job has been created successfully. Workers can now see it.",
    "jobPublished.item1": "The job appears in the job list",
    "jobPublished.item2": "Workers can apply",
    "jobPublished.item3": "The company can select candidates",
    "jobPublished.item4": "The contract will be generated in the app",

    "workerAccepted.title": "Worker accepted",
    "workerAccepted.subtitle":
      "The company accepted the worker. The next step is generating the contract.",
    "workerAccepted.item1": "Confirm worker identity",
    "workerAccepted.item2": "Confirm company details",
    "workerAccepted.item3": "Generate legal contract",
    "workerAccepted.item4": "Set time, location and payment",
    "workerAccepted.generateContract": "Generate contract",

    "contract.title": "Contract generated",
    "contract.subtitle":
      "The demo contract has been prepared for signing.",
    "contract.details": "Contract details",
    "contract.readyStatus": "Ready for signing",
    "contract.noteTitle": "MVP note",
    "contract.noteText":
      "This is only a demo contract for the app. Real contracts must be legally reviewed before use.",
    "contract.send": "Send for signing",

    "contractSent.title": "Contract sent",
    "contractSent.subtitle":
      "The contract was sent for signing to the company and worker.",
    "contractSent.signStatus": "Signing status",
    "contractSent.item1": "Contract generated",
    "contractSent.item2": "Sent to the company",
    "contractSent.item3": "Sent to the worker",
    "contractSent.pending": "Waiting for signatures",
    "contractSent.afterTitle": "After signing",
    "contractSent.after1": "The job becomes active",
    "contractSent.after2": "The worker can start work",
    "contractSent.after3": "Payment will be tracked in the app",
    "contractSent.simulate": "Simulate completed signing",

    "jobActive.title": "Active job",
    "jobActive.subtitle":
      "The contract has been signed. The worker can start work.",
    "jobActive.details": "Job details",
    "jobActive.active": "Active",
    "jobActive.nextTitle": "Next step",
    "jobActive.item1": "The worker arrives at the location",
    "jobActive.item2": "They check in through the app",
    "jobActive.item3": "Work time is tracked",
    "jobActive.item4": "Payment is calculated by hours",
    "jobActive.checkIn": "Worker check-in",

    "checkIn.title": "Check-in done",
    "checkIn.subtitle":
      "The worker started work. The start time was recorded.",
    "checkIn.timeTitle": "Work time",
    "checkIn.startNow": "now",
    "checkIn.inProgress": "In progress",
    "checkIn.item1": "The worker is working",
    "checkIn.item2": "Time is tracked",
    "checkIn.item3": "At the end, they check out",
    "checkIn.item4": "Payment is calculated by hours",
    "checkIn.checkOut": "Worker check-out",

    "checkOut.title": "Check-out done",
    "checkOut.subtitle":
      "The work has ended. Worked hours have been calculated.",
    "checkOut.summary": "Work summary",
    "checkOut.hours": "Worked hours",
    "checkOut.estimatedPay": "Estimated payment",
    "checkOut.item1": "The company confirms the hours",
    "checkOut.item2": "Payment is prepared",
    "checkOut.item3": "The worker receives the money",
    "checkOut.item4": "Both sides can leave a rating",
    "checkOut.continuePayment": "Continue to payment",

    "payment.title": "Payment prepared",
    "payment.subtitle":
      "Hours have been calculated. Payment is ready for processing.",
    "payment.calculation": "Payment calculation",
    "payment.grossTotal": "Gross total",
    "payment.workerFee": "WAP worker fee",
    "payment.businessFee": "WAP company fee",
    "payment.workerTotal": "Estimated worker total",
    "payment.statusTitle": "Payment status",
    "payment.item1": "Hours calculated",
    "payment.item2": "WAP fees calculated",
    "payment.item3": "Payment prepared",
    "payment.pending": "Waiting for company confirmation",
    "payment.confirm": "Confirm payment",

    "paymentConfirmed.title": "Payment confirmed",
    "paymentConfirmed.subtitle":
      "The company confirmed the hours and payment. The worker will receive the money.",
    "paymentConfirmed.summary": "Final summary",
    "paymentConfirmed.workerPay": "Worker payment",
    "paymentConfirmed.statusTitle": "Status",
    "paymentConfirmed.item1": "The work was completed",
    "paymentConfirmed.item2": "Hours were confirmed",
    "paymentConfirmed.item3": "Payment was confirmed",
    "paymentConfirmed.success": "Job completed successfully",
    "paymentConfirmed.continueRating": "Continue to rating",

    "rating.title": "Final rating",
    "rating.subtitle":
      "The job has been completed. Now both sides can rate the collaboration.",
    "rating.workerTitle": "Worker rating",
    "rating.workerItem1": "Good punctuality",
    "rating.workerItem2": "Work completed",
    "rating.workerItem3": "Professional behavior",
    "rating.businessTitle": "Company rating",
    "rating.businessItem1": "Reliable company",
    "rating.businessItem2": "Payment confirmed",
    "rating.businessItem3": "Contract respected",
    "rating.finish": "Finish job",

    "jobCompleted.title": "Job completed",
    "jobCompleted.subtitle":
      "The job has been fully completed. Contract, payment and rating have been processed.",
    "jobCompleted.summary": "Final summary",
    "jobCompleted.item1": "Job published",
    "jobCompleted.item2": "Worker accepted",
    "jobCompleted.item3": "Contract generated and sent",
    "jobCompleted.item4": "Check-in and check-out completed",
    "jobCompleted.item5": "Payment confirmed",
    "jobCompleted.item6": "Rating completed",
    "jobCompleted.mvpTitle": "WAP MVP status",
    "jobCompleted.mvp1": "The main flow works.",
    "jobCompleted.mvp2": "Next real step: save data and backend.",

    "explore.title": "Explore",
    "explore.subtitle":
      "This starter app includes example code to help you get started.",
    "explore.docs": "Expo documentation",
    "explore.routing": "File-based routing",
    "explore.routingText1":
      "This app has two example screens: src/app/index.tsx and src/app/explore.tsx.",
    "explore.routingText2":
      "The layout file in src/app/_layout.tsx sets up the navigator.",
    "explore.learnMore": "Learn more",
    "explore.platforms": "Android, iOS, and web support",
    "explore.platformsText":
      "You can open this project on Android, iOS, and the web. Press w in the terminal to open the web version.",
    "explore.images": "Images",
    "explore.imagesText":
      "For static images, you can use @2x and @3x suffixes to provide files for different screen densities.",
    "explore.theme": "Light and dark mode components",
    "explore.themeText":
      "This template supports light and dark mode. The useColorScheme() hook shows the user's current color scheme.",
    "explore.animations": "Animations",
    "explore.animationsText":
      "This template includes an example animated component. src/components/ui/collapsible.tsx uses react-native-reanimated.",
  },

  ro: {
    "common.apply": "Aplică",
    "common.back": "Înapoi",
    "common.backToActiveJob": "Înapoi la job activ",
    "common.backToApplications": "Înapoi la aplicări",
    "common.backToBusinessDashboard": "Înapoi la dashboard firmă",
    "common.backToCheckIn": "Înapoi la check-in",
    "common.backToCheckOut": "Înapoi la check-out",
    "common.backToContract": "Înapoi la contract",
    "common.backToDashboard": "Înapoi la dashboard",
    "common.backToForm": "Înapoi la formular",
    "common.backToJob": "Înapoi la job",
    "common.backToJobs": "Înapoi la joburi",
    "common.backToPayment": "Înapoi la plată",
    "common.backToStart": "Înapoi la început",
    "common.business": "Firmă",
    "common.city": "Oraș",
    "common.company": "Firmă",
    "common.confirm": "Confirmă",
    "common.continue": "Continuă",
    "common.dashboardBusiness": "Dashboard firmă",
    "common.dashboardWorker": "Dashboard lucrător",
    "common.job": "Job",
    "common.location": "Locație",
    "common.nextSteps": "Următorii pași",
    "common.pay": "Plată",
    "common.payPerHour": "Plată/oră",
    "common.save": "Salvează",
    "common.status": "Status",
    "common.start": "Începe",
    "common.startTime": "Start",
    "common.worker": "Lucrător",
    "demo.amount.businessFee": "4 €",
    "demo.amount.grossTotal": "120 €",
    "demo.amount.pay15": "15 €",
    "demo.amount.workerTotal": "116 €",
    "demo.city.augsburg": "Augsburg",
    "demo.city.munich": "München",
    "demo.company.wapLogistics": "WAP Logistics GmbH",
    "demo.hours.eight": "8",
    "demo.pay14PerHour": "14 €/oră",
    "demo.pay15PerHour": "15 €/oră",
    "demo.worker.ion": "Ion Popescu",
    "demo.worker.maria": "Maria Ionescu",

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

    "chooseRole.title": "Alege rolul",
    "chooseRole.subtitle": "Cum vrei să folosești WAP?",
    "chooseRole.workerTitle": "Sunt lucrător",
    "chooseRole.workerDescription":
      "Caut locuri de muncă, joburi scurte sau contracte legale.",
    "chooseRole.businessTitle": "Sunt firmă",
    "chooseRole.businessDescription":
      "Vreau să găsesc oameni verificați pentru muncă.",

    "welcome.title": "WAP",
    "welcome.subtitle": "Construiește-ți viitorul.",
    "welcome.description":
      "Un ecosistem pentru cariere, servicii, firme și oportunități.",
    "welcome.start": "Începe",

    "worker.title": "Profil lucrător",
    "worker.subtitle":
      "Creează profilul tău ca firmele să te poată găsi și să îți ofere joburi potrivite.",
    "worker.card.title": "Ce faci mai departe",
    "worker.card.item1": "Adaugi datele personale",
    "worker.card.item2": "Alegi domeniul de muncă",
    "worker.card.item3": "Setezi disponibilitatea",
    "worker.card.item4": "Vezi joburi potrivite",
    "worker.continue": "Creează profilul",

    "business.title": "Profil firmă",
    "business.subtitle":
      "Creează profilul firmei, publică joburi și gestionează aplicările.",
    "business.card.title": "Ce poate face firma ta",
    "business.card.item1": "Adaugă datele firmei",
    "business.card.item2": "Publică oferte de muncă",
    "business.card.item3": "Vezi aplicările",
    "business.card.item4": "Gestionează contracte și plăți",
    "business.continue": "Configurează firma",

    "workerForm.title": "Date lucrător",
    "workerForm.subtitle":
      "Completează informațiile principale ca firmele să îți înțeleagă mai bine profilul.",
    "workerForm.name": "Nume complet",
    "workerForm.namePlaceholder": "ex. Ion Popescu",
    "workerForm.city": "Oraș",
    "workerForm.cityPlaceholder": "ex. Augsburg",
    "workerForm.workType": "Domeniu de muncă",
    "workerForm.workTypePlaceholder": "ex. depozit, curățenie, șofer",
    "workerForm.availability": "Disponibilitate",
    "workerForm.availabilityPlaceholder": "ex. luni până vineri",
    "workerForm.save": "Salvează profilul",

    "businessForm.title": "Date firmă",
    "businessForm.subtitle":
      "Adaugă datele principale ale firmei ca să poți publica joburi.",
    "businessForm.companyName": "Numele firmei",
    "businessForm.companyNamePlaceholder": "ex. WAP Logistics GmbH",
    "businessForm.city": "Oraș",
    "businessForm.cityPlaceholder": "ex. München",
    "businessForm.workType": "Domeniu de muncă",
    "businessForm.workTypePlaceholder": "ex. depozit, curățenie, livrare",
    "businessForm.workersNeeded": "Lucrători necesari",
    "businessForm.workersNeededPlaceholder": "ex. 5",
    "businessForm.save": "Salvează firma",

    "workerDashboard.title": "Dashboard lucrător",
    "workerDashboard.subtitle":
      "Profilul tău a fost creat. Aici vei vedea joburi disponibile.",
    "workerDashboard.item1": "Verificare identitate",
    "workerDashboard.item2": "Alegere tipuri de muncă",
    "workerDashboard.item3": "Setare disponibilitate",
    "workerDashboard.item4": "Primire oferte de job",
    "workerDashboard.jobsTitle": "Joburi recomandate",
    "workerDashboard.empty":
      "Ai joburi demo disponibile. Intră în lista de joburi pentru a aplica.",
    "workerDashboard.viewJobs": "Vezi joburi",

    "businessDashboard.title": "Dashboard firmă",
    "businessDashboard.subtitle":
      "Profilul firmei a fost creat. Aici vei gestiona joburile și lucrătorii.",
    "businessDashboard.item1": "Verificare firmă",
    "businessDashboard.item2": "Creare primul job",
    "businessDashboard.item3": "Selectare lucrători",
    "businessDashboard.item4": "Contract și plată prin aplicație",
    "businessDashboard.jobsTitle": "Joburi postate",
    "businessDashboard.empty":
      "Momentan firma nu are joburi salvate real. Avem doar flow demo pentru MVP.",
    "businessDashboard.createJob": "Creează job",
    "businessDashboard.viewApplications": "Vezi aplicări",

    "jobs.title": "Joburi disponibile",
    "jobs.subtitle":
      "Aici lucrătorul va vedea joburile publicate de firme.",
    "jobs.warehouseTitle": "Lucrător depozit",
    "jobs.warehousePeople": "👥 4 oameni căutați",
    "jobs.warehouseDescription":
      "Sortare pachete, muncă în depozit, program flexibil.",
    "jobs.cleaningTitle": "Curățenie birouri",
    "jobs.cleaningPeople": "👥 2 oameni căutați",
    "jobs.cleaningDescription":
      "Curățenie în birouri, seara, contract legal prin aplicație.",

    "applicationSent.title": "Aplicare trimisă",
    "applicationSent.subtitle":
      "Ai aplicat la job. Firma va vedea profilul tău și te poate selecta.",
    "applicationSent.cardTitle": "Ce urmează?",
    "applicationSent.item1": "Firma primește aplicarea ta",
    "applicationSent.item2": "Profilul tău poate fi verificat",
    "applicationSent.item3": "Dacă ești acceptat, urmează contractul",
    "applicationSent.item4": "Plata va fi organizată prin aplicație",

    "applications.title": "Aplicări primite",
    "applications.subtitle":
      "Aici firma vede lucrătorii care au aplicat la joburi.",
    "applications.appliedTo": "A aplicat la",
    "applications.availability": "Disponibilitate",
    "applications.pending": "În așteptare",
    "applications.accept": "Acceptă",
    "applications.reject": "Respinge",
    "applications.ionAvailability": "Weekend și seara",
    "applications.mariaAvailability": "Luni-vineri seara",

    "createJob.title": "Creează job",
    "createJob.subtitle":
      "Completează detaliile jobului pe care vrei să îl postezi.",
    "createJob.jobTitle": "Titlu job",
    "createJob.jobTitlePlaceholder": "ex. Lucrător depozit",
    "createJob.cityPlaceholder": "ex. Augsburg",
    "createJob.payPerHour": "Plată pe oră",
    "createJob.payPlaceholder": "ex. 15",
    "createJob.workersNeeded": "Câți oameni cauți?",
    "createJob.workersPlaceholder": "ex. 4",
    "createJob.description": "Descriere job",
    "createJob.descriptionPlaceholder":
      "ex. Muncă în depozit, sortare pachete, program flexibil.",
    "createJob.publish": "Publică jobul",

    "jobPublished.title": "Job publicat",
    "jobPublished.subtitle":
      "Jobul tău a fost creat cu succes. Acum poate fi văzut de lucrători.",
    "jobPublished.item1": "Jobul apare în lista de joburi",
    "jobPublished.item2": "Lucrătorii pot aplica",
    "jobPublished.item3": "Firma poate selecta candidați",
    "jobPublished.item4": "Contractul va fi generat în aplicație",

    "workerAccepted.title": "Lucrător acceptat",
    "workerAccepted.subtitle":
      "Firma a acceptat lucrătorul. Următorul pas este generarea contractului.",
    "workerAccepted.item1": "Confirmare identitate lucrător",
    "workerAccepted.item2": "Confirmare date firmă",
    "workerAccepted.item3": "Generare contract legal",
    "workerAccepted.item4": "Stabilire oră, locație și plată",
    "workerAccepted.generateContract": "Generează contract",

    "contract.title": "Contract generat",
    "contract.subtitle":
      "Contractul demo a fost pregătit pentru semnare.",
    "contract.details": "Detalii contract",
    "contract.readyStatus": "Pregătit pentru semnare",
    "contract.noteTitle": "Notă MVP",
    "contract.noteText":
      "Acesta este doar un contract demo pentru aplicație. Contractele reale trebuie verificate juridic înainte de folosire.",
    "contract.send": "Trimite spre semnare",

    "contractSent.title": "Contract trimis",
    "contractSent.subtitle":
      "Contractul a fost trimis spre semnare către firmă și lucrător.",
    "contractSent.signStatus": "Status semnare",
    "contractSent.item1": "Contract generat",
    "contractSent.item2": "Trimis către firmă",
    "contractSent.item3": "Trimis către lucrător",
    "contractSent.pending": "Așteaptă semnăturile",
    "contractSent.afterTitle": "După semnare",
    "contractSent.after1": "Jobul devine activ",
    "contractSent.after2": "Lucrătorul poate începe munca",
    "contractSent.after3": "Plata va fi urmărită în aplicație",
    "contractSent.simulate": "Simulează semnare completă",

    "jobActive.title": "Job activ",
    "jobActive.subtitle":
      "Contractul a fost semnat. Lucrătorul poate începe munca.",
    "jobActive.details": "Detalii job",
    "jobActive.active": "Activ",
    "jobActive.nextTitle": "Următorul pas",
    "jobActive.item1": "Lucrătorul ajunge la locație",
    "jobActive.item2": "Face check-in în aplicație",
    "jobActive.item3": "Timpul de muncă este urmărit",
    "jobActive.item4": "Plata se calculează după ore",
    "jobActive.checkIn": "Check-in lucrător",

    "checkIn.title": "Check-in făcut",
    "checkIn.subtitle":
      "Lucrătorul a început munca. Ora de start a fost înregistrată.",
    "checkIn.timeTitle": "Timp muncă",
    "checkIn.startNow": "acum",
    "checkIn.inProgress": "În lucru",
    "checkIn.item1": "Lucrătorul muncește",
    "checkIn.item2": "Timpul este urmărit",
    "checkIn.item3": "La final face check-out",
    "checkIn.item4": "Plata se calculează după ore",
    "checkIn.checkOut": "Check-out lucrător",

    "checkOut.title": "Check-out făcut",
    "checkOut.subtitle":
      "Munca a fost încheiată. Orele lucrate au fost calculate.",
    "checkOut.summary": "Rezumat muncă",
    "checkOut.hours": "Ore lucrate",
    "checkOut.estimatedPay": "Plată estimată",
    "checkOut.item1": "Firma confirmă orele",
    "checkOut.item2": "Plata este pregătită",
    "checkOut.item3": "Lucrătorul primește banii",
    "checkOut.item4": "Ambele părți pot da rating",
    "checkOut.continuePayment": "Continuă spre plată",

    "payment.title": "Plată pregătită",
    "payment.subtitle":
      "Orele au fost calculate. Plata este pregătită pentru procesare.",
    "payment.calculation": "Calcul plată",
    "payment.grossTotal": "Total brut",
    "payment.workerFee": "Taxă WAP lucrător",
    "payment.businessFee": "Taxă WAP firmă",
    "payment.workerTotal": "Total estimat lucrător",
    "payment.statusTitle": "Status plată",
    "payment.item1": "Ore calculate",
    "payment.item2": "Taxe WAP calculate",
    "payment.item3": "Plata pregătită",
    "payment.pending": "Așteaptă confirmarea firmei",
    "payment.confirm": "Confirmă plata",

    "paymentConfirmed.title": "Plată confirmată",
    "paymentConfirmed.subtitle":
      "Firma a confirmat orele și plata. Lucrătorul va primi banii.",
    "paymentConfirmed.summary": "Rezumat final",
    "paymentConfirmed.workerPay": "Plată lucrător",
    "paymentConfirmed.statusTitle": "Status",
    "paymentConfirmed.item1": "Munca a fost finalizată",
    "paymentConfirmed.item2": "Orele au fost confirmate",
    "paymentConfirmed.item3": "Plata a fost confirmată",
    "paymentConfirmed.success": "Job finalizat cu succes",
    "paymentConfirmed.continueRating": "Continuă spre rating",

    "rating.title": "Rating final",
    "rating.subtitle":
      "Jobul a fost finalizat. Acum ambele părți pot evalua colaborarea.",
    "rating.workerTitle": "Evaluare lucrător",
    "rating.workerItem1": "Punctualitate bună",
    "rating.workerItem2": "Muncă finalizată",
    "rating.workerItem3": "Comportament profesional",
    "rating.businessTitle": "Evaluare firmă",
    "rating.businessItem1": "Firmă serioasă",
    "rating.businessItem2": "Plată confirmată",
    "rating.businessItem3": "Contract respectat",
    "rating.finish": "Finalizează jobul",

    "jobCompleted.title": "Job finalizat",
    "jobCompleted.subtitle":
      "Jobul a fost încheiat complet. Contractul, plata și ratingul au fost procesate.",
    "jobCompleted.summary": "Rezumat final",
    "jobCompleted.item1": "Job publicat",
    "jobCompleted.item2": "Lucrător acceptat",
    "jobCompleted.item3": "Contract generat și trimis",
    "jobCompleted.item4": "Check-in și check-out făcute",
    "jobCompleted.item5": "Plata confirmată",
    "jobCompleted.item6": "Rating finalizat",
    "jobCompleted.mvpTitle": "WAP MVP status",
    "jobCompleted.mvp1": "Fluxul principal funcționează.",
    "jobCompleted.mvp2": "Următorul pas real: salvare date și backend.",

    "explore.title": "Explorează",
    "explore.subtitle":
      "Această aplicație starter include cod exemplu ca să începi mai ușor.",
    "explore.docs": "Documentație Expo",
    "explore.routing": "Rutare pe bază de fișiere",
    "explore.routingText1":
      "Această aplicație are două ecrane exemplu: src/app/index.tsx și src/app/explore.tsx.",
    "explore.routingText2":
      "Fișierul de layout din src/app/_layout.tsx configurează navigatorul.",
    "explore.learnMore": "Află mai mult",
    "explore.platforms": "Suport Android, iOS și web",
    "explore.platformsText":
      "Poți deschide proiectul pe Android, iOS și web. Apasă w în terminal pentru versiunea web.",
    "explore.images": "Imagini",
    "explore.imagesText":
      "Pentru imagini statice poți folosi sufixele @2x și @3x pentru densități diferite de ecran.",
    "explore.theme": "Componente light și dark mode",
    "explore.themeText":
      "Acest template suportă light și dark mode. Hook-ul useColorScheme() arată schema curentă de culori a utilizatorului.",
    "explore.animations": "Animații",
    "explore.animationsText":
      "Acest template include un exemplu de componentă animată. src/components/ui/collapsible.tsx folosește react-native-reanimated.",
  },
};

export function translate(language: LanguageCode, key: string) {
  return translations[language][key] ?? translations.de[key] ?? key;
}
