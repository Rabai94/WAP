import type { AppIconName } from "@/components/navigation/AppIcon";
import type { LanguageCode } from "@/i18n/translations";

export type SidebarNavigationItem = {
  activePaths?: string[];
  disabled?: boolean;
  icon: AppIconName;
  key: MainNavigationKey | AdminNavigationKey | "settings" | "logout";
  label: string;
  route?: string;
  soon?: boolean;
};

type MainNavigationKey =
  | "home"
  | "profile"
  | "jobs"
  | "tasks"
  | "services"
  | "transport"
  | "courses"
  | "messages"
  | "organizations";

type AdminNavigationKey = "moderation" | "admin-organizations" | "reports";

const navigationCopy = {
  ro: {
    home: "Acasă",
    profile: "Contul meu",
    jobs: "Locuri de muncă",
    tasks: "Lucrări",
    services: "Servicii",
    transport: "Transport",
    courses: "Cursuri",
    messages: "Mesaje",
    organizations: "Organizațiile mele",
    adminSection: "Administrare platformă",
    moderation: "Moderare",
    adminOrganizations: "Organizații",
    reports: "Raportări",
    settings: "Setări",
    logout: "Logout",
    soon: "În curând",
  },
  en: {
    home: "Home",
    profile: "My account",
    jobs: "Jobs",
    tasks: "Tasks",
    services: "Services",
    transport: "Transport",
    courses: "Courses",
    messages: "Messages",
    organizations: "My organizations",
    adminSection: "Platform administration",
    moderation: "Moderation",
    adminOrganizations: "Organizations",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    soon: "Coming soon",
  },
  de: {
    home: "Start",
    profile: "Mein Konto",
    jobs: "Jobs",
    tasks: "Aufträge",
    services: "Dienstleistungen",
    transport: "Transport",
    courses: "Kurse",
    messages: "Nachrichten",
    organizations: "Meine Organisationen",
    adminSection: "Plattformverwaltung",
    moderation: "Moderation",
    adminOrganizations: "Organisationen",
    reports: "Meldungen",
    settings: "Einstellungen",
    logout: "Abmelden",
    soon: "Demnächst",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

export function getMainNavigation(language: LanguageCode): SidebarNavigationItem[] {
  const copy = navigationCopy[language];

  return [
    { key: "home", label: copy.home, icon: "home", route: "/engine", activePaths: ["/engine"] },
    {
      key: "profile",
      label: copy.profile,
      icon: "profile",
      route: "/profile",
      activePaths: ["/profile", "/onboarding"],
    },
    {
      key: "jobs",
      label: copy.jobs,
      icon: "briefcase",
      route: "/jobs",
      activePaths: [
        "/jobs",
        "/create-job",
        "/job-",
        "/applications",
        "/application-",
        "/contract",
        "/worker-accepted",
        "/check-in",
        "/check-out",
        "/payment",
        "/rating",
      ],
    },
    { key: "tasks", label: copy.tasks, icon: "task", route: "/tasks", activePaths: ["/tasks"] },
    { key: "services", label: copy.services, icon: "service", route: "/services", activePaths: ["/services"] },
    { key: "transport", label: copy.transport, icon: "transport", disabled: true, soon: true },
    {
      key: "courses",
      label: copy.courses,
      icon: "course",
      route: "/courses",
      activePaths: ["/courses", "/credentials/issuer"],
    },
    { key: "messages", label: copy.messages, icon: "message", route: "/messages", activePaths: ["/messages"] },
    {
      key: "organizations",
      label: copy.organizations,
      icon: "organization",
      route: "/organizations",
      activePaths: ["/organizations"],
    },
  ];
}

export function getAdminNavigation(language: LanguageCode): SidebarNavigationItem[] {
  const copy = navigationCopy[language];

  return [
    { key: "moderation", label: copy.moderation, icon: "admin", disabled: true, soon: true },
    {
      key: "admin-organizations",
      label: copy.adminOrganizations,
      icon: "organization",
      disabled: true,
      soon: true,
    },
    { key: "reports", label: copy.reports, icon: "report", disabled: true, soon: true },
  ];
}

export function getSidebarUtilityCopy(language: LanguageCode) {
  const copy = navigationCopy[language];

  return {
    adminSection: copy.adminSection,
    logout: copy.logout,
    settings: copy.settings,
    soon: copy.soon,
  };
}

export function isSidebarRouteActive(pathname: string, item: SidebarNavigationItem) {
  return Boolean(
    item.activePaths?.some((path) =>
      path === "/engine"
        ? pathname === path
        : pathname === path || pathname.startsWith(`${path}/`) || pathname.startsWith(path)
    )
  );
}
