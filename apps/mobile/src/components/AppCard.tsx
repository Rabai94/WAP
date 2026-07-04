import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type AppCardProps = {
  title?: string;
  children: ReactNode;
};

export default function AppCard({ title, children }: AppCardProps) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D8BC",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 12,
  },
});