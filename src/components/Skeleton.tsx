import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radius } from "../theme";

export default function Skeleton() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      <View style={styles.cover} />
      <View style={styles.body}>
        <View style={[styles.bar, { width: "45%" }]} />
        <View style={[styles.bar, { width: "90%" }]} />
        <View style={[styles.bar, { width: "70%" }]} />
        <View style={styles.button} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  cover: { width: "100%", aspectRatio: 4 / 5, backgroundColor: colors.chip },
  body: { padding: 16, gap: 12 },
  bar: { height: 12, borderRadius: 6, backgroundColor: colors.chip },
  button: { height: 52, borderRadius: 16, backgroundColor: colors.chip, marginTop: 6 },
});
