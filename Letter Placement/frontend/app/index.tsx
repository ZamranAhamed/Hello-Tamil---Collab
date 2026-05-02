import { View, Text, Image, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function MainHome() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Banner */}
        <Image
          source={require("../assets/images/hello_tamil_banner.png")}
          style={styles.banner}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>
          Fun Tamil Learning for Kids
        </Text>

        {/* Module Cards */}
        <View style={styles.cardContainer}>
          <ModuleCard
            title="Letter Identification"
            emoji="🔤"
            href="/modules/letter_identification"
          />

          <ModuleCard
            title="Bilingual Translation"
            emoji="🌍"
            href="/modules/bilingual_translation"
          />

          <ModuleCard
            title="Speech Training"
            emoji="🎤"
            href="/modules/speech_training"
          />

          <ModuleCard
            title="Writing Training"
            emoji="✏️"
            href="/modules/writing_training"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function ModuleCard({ title, emoji, href }: any) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.cardText}>{title}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6",
    padding: 20,
  },
  banner: {
    width: "100%",
    height: 180,
    marginTop: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 15,
    color: "#333",
    fontWeight: "600",
  },
  cardContainer: {
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 40,
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});