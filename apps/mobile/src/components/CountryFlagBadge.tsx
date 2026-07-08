import { StyleSheet, Text, View } from "react-native";

type CountryFlagBadgeProps = {
  code: string;
  colors: string[];
  pattern: "vertical" | "horizontal";
};

export default function CountryFlagBadge({
  code,
  colors,
  pattern,
}: CountryFlagBadgeProps) {
  return (
    <View style={styles.badge}>
      <View
        style={[
          styles.stripes,
          pattern === "horizontal" && styles.horizontalStripes,
        ]}
      >
        {colors.slice(0, 3).map((color, index) => (
          <View
            key={`${color}-${index}`}
            style={[styles.stripe, { backgroundColor: color }]}
          />
        ))}
      </View>
      <View style={styles.overlay} />
      <Text style={styles.code}>{code}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderColor: "rgba(17, 24, 39, 0.18)",
    borderRadius: 6,
    borderWidth: 1,
    height: 26,
    justifyContent: "center",
    overflow: "hidden",
    width: 44,
  },
  stripes: {
    bottom: 0,
    flexDirection: "row",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  horizontalStripes: {
    flexDirection: "column",
  },
  stripe: {
    flex: 1,
  },
  overlay: {
    backgroundColor: "rgba(17, 24, 39, 0.22)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  code: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textShadowColor: "rgba(17, 24, 39, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
