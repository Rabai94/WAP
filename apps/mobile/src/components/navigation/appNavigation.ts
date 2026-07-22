import type { AppIconName } from "@/components/navigation/AppIcon";
import type { LanguageCode } from "@/i18n/translations";

export type SidebarNavigationItem = {
  activePaths: string[];
  icon: AppIconName;
  key: MainNavigationKey;
  label: string;
  route: string;
};

type MainNavigationKey =
  | "home"
  | "jobs"
  | "courses"
  | "profile"
  | "organizations"
  | "messages";

const navigationCopy = {
  ro: {
    courses: "Cursuri",
    home: "Acasă",
    jobs: "Locuri de muncă",
    logout: "Deconectare",
    messages: "Mesaje",
    organizations: "Organizațiile mele",
    profile: "Contul meu",
    settings: "Setări",
  },
  en: {
    courses: "Courses",
    home: "Home",
    jobs: "Jobs",
    logout: "Sign out",
    messages: "Messages",
    organizations: "My organizations",
    profile: "My account",
    settings: "Settings",
  },
  de: {
    courses: "Kurse",
    home: "Start",
    jobs: "Jobs",
    logout: "Abmelden",
    messages: "Nachrichten",
    organizations: "Meine Organisationen",
    profile: "Mein Konto",
    settings: "Einstellungen",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

export function getMainNavigation(
  language: LanguageCode
): SidebarNavigationItem[] {
  const copy = navigationCopy[language];

  return [
    {
      activePaths: ["/engine"],
      icon: "home",
      key: "home",
      label: copy.home,
      route: "/engine",
    },
    {
      activePaths: [
        "/jobs",
        "/create-job",
        "/job-published",
        "/applications",
        "/application-sent",
      ],
      icon: "briefcase",
      key: "jobs",
      label: copy.jobs,
      route: "/jobs",
    },
    {
      activePaths: ["/courses"],
      icon: "course",
      key: "courses",
      label: copy.courses,
      route: "/courses",
    },
    {
      activePaths: ["/profile", "/onboarding"],
      icon: "profile",
      key: "profile",
      label: copy.profile,
      route: "/profile",
    },
    {
      activePaths: ["/organizations"],
      icon: "organization",
      key: "organizations",
      label: copy.organizations,
      route: "/organizations",
    },
    {
      activePaths: ["/messages"],
      icon: "message",
      key: "messages",
      label: copy.messages,
      route: "/messages",
    },
  ];
}

export function getSidebarUtilityCopy(language: LanguageCode) {
  const copy = navigationCopy[language];

  return {
    logout: copy.logout,
    settings: copy.settings,
  };
}

export function isSidebarRouteActive(
  pathname: string,
  item: SidebarNavigationItem
) {
  return item.activePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
