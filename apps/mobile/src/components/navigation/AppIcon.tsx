import { SymbolView } from "expo-symbols";
import { StyleSheet, Text } from "react-native";

export type AppIconName =
  | "admin"
  | "bell"
  | "briefcase"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "course"
  | "home"
  | "logout"
  | "menu"
  | "message"
  | "organization"
  | "profile"
  | "report"
  | "search"
  | "service"
  | "settings"
  | "task"
  | "transport";

const iconNames = {
  admin: { ios: "shield.fill", android: "admin_panel_settings", web: "admin_panel_settings" },
  bell: { ios: "bell", android: "notifications", web: "notifications" },
  briefcase: { ios: "briefcase.fill", android: "work", web: "work" },
  "chevron-left": { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  "chevron-right": { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  close: { ios: "xmark", android: "close", web: "close" },
  course: { ios: "graduationcap.fill", android: "school", web: "school" },
  home: { ios: "house.fill", android: "home", web: "home" },
  logout: { ios: "rectangle.portrait.and.arrow.right", android: "logout", web: "logout" },
  menu: { ios: "line.3.horizontal", android: "menu", web: "menu" },
  message: { ios: "message.fill", android: "chat_bubble", web: "chat_bubble" },
  organization: { ios: "building.2.fill", android: "corporate_fare", web: "corporate_fare" },
  profile: { ios: "person.crop.circle.fill", android: "account_circle", web: "account_circle" },
  report: { ios: "exclamationmark.bubble.fill", android: "report", web: "report" },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  service: { ios: "wrench.and.screwdriver.fill", android: "design_services", web: "design_services" },
  settings: { ios: "gearshape.fill", android: "settings", web: "settings" },
  task: { ios: "checklist", android: "task_alt", web: "task_alt" },
  transport: { ios: "truck.box.fill", android: "local_shipping", web: "local_shipping" },
} as const;

const fallbacks: Record<AppIconName, string> = {
  admin: "A",
  bell: "!",
  briefcase: "J",
  "chevron-left": "‹",
  "chevron-right": "›",
  close: "×",
  course: "C",
  home: "A",
  logout: "↗",
  menu: "≡",
  message: "M",
  organization: "O",
  profile: "P",
  report: "R",
  search: "⌕",
  service: "S",
  settings: "S",
  task: "L",
  transport: "T",
};

type AppIconProps = {
  color: string;
  name: AppIconName;
  size?: number;
};

export default function AppIcon({ color, name, size = 20 }: AppIconProps) {
  return (
    <SymbolView
      fallback={
        <Text style={[styles.fallback, { color, fontSize: Math.max(size - 5, 11) }]}>
          {fallbacks[name]}
        </Text>
      }
      name={iconNames[name]}
      size={size}
      tintColor={color}
      weight="semibold"
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    fontWeight: "800",
    textAlign: "center",
  },
});
