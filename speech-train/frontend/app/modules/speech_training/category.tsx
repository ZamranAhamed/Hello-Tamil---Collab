import { Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getWords } from "../../../services/api";
import { emojiMap } from "../../../data/emojiMap";

export default function Category() {
  const { name } = useLocalSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!name) return;

      const data = await getWords(name as string);
      setItems(Array.isArray(data) ? data : data?.items ?? []);
    }

    load();
  }, [name]);

  function getEmoji(category: any, word: any) {
    const key = (word || "").toLowerCase().trim();

    const normalized = key.endsWith("s")
      ? key.slice(0, -1)
      : key;

    if (emojiMap[category] && emojiMap[category][normalized]) {
      return emojiMap[category][normalized];
    }

    return "⭐";
  }

  function getColor(index: number) {
    const colors = [
      "#FFD54F",
      "#81C784",
      "#64B5F6",
      "#FF8A65",
      "#BA68C8",
      "#F06292"
    ];

    return colors[index % colors.length];
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <Pressable
          style={[styles.card, { backgroundColor: getColor(index) }]}
          onPress={() =>
            router.push({
              pathname: "/modules/speech_training/practice",
              params: {
                word: item.tamilWord,
                english: item.englishMeaning,
                sinhala: item.sinhalaMeaning,
                image: item.imageUrl,
                audio: item.audioUrl
              }
            })
          }
        >
          <Text style={styles.emoji}>
            {getEmoji(name, item.englishMeaning)}
          </Text>

          <Text style={styles.tamil}>{item.tamilWord}</Text>
          <Text style={styles.sinhala}>{item.sinhalaMeaning}</Text>
          <Text style={styles.english}>{item.englishMeaning}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 25,
    margin: 15,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5
  },

  emoji: {
    fontSize: 60
  },

  tamil: {
    fontSize: 28,
    fontWeight: "bold"
  },

  sinhala: {
    fontSize: 20,
    marginTop: 5
  },

  english: {
    fontSize: 18,
    marginTop: 5
  }
});