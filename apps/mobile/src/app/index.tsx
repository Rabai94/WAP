import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>WAP</Text>
      <Text style={styles.title}>WorkAlfa Platform</Text>
      <Text style={styles.subtitle}>
        O singură platformă pentru muncă, servicii și afaceri.
      </Text>

      <View style={styles.button}>
        <Text style={styles.buttonText}>Începe</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 64,
    fontWeight: '900',
    color: '#D62828',
    letterSpacing: 4,
  },
  title: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 18,
    color: '#444444',
    textAlign: 'center',
    maxWidth: 420,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#D62828',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});