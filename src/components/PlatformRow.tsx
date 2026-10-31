import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

const ICONS = [
  { id: "tiktok", src: require("../../assets/platforms/tiktok.png") },
  { id: "instagram", src: require("../../assets/platforms/instagram.png") },
  { id: "youtube", src: require("../../assets/platforms/youtube.png") },
  { id: "x", src: require("../../assets/platforms/x.png") },
  { id: "threads", src: require("../../assets/platforms/threads.png") },
  { id: "pinterest", src: require("../../assets/platforms/pinterest.png") },
  { id: "spotify", src: require("../../assets/platforms/spotify.png") },
];

export default function PlatformRow({ active }: { active?: string | null }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={[styles.line, { opacity: 0.6 }]} />
        <Text style={styles.title}>Applications Support</Text>
        <View style={[styles.line, { opacity: 0.6 }]} />
      </View>
      <View style={styles.row}>
        {ICONS.map((item) => (
          <Image
            key={item.id}
            source={item.src}
            style={[styles.icon, active && active !== item.id && { opacity: 0.5 }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20, marginTop: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: "rgba(232,234,240,0.25)" },
  title: { color: colors.mute, fontSize: 13, letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  icon: { width: 36, height: 36 },
});
