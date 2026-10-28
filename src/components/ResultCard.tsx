import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { fileName } from "../lib/filename";
import { formatBytes } from "../lib/bytes";
import { formatCount, formatDuration, splitCaption } from "../lib/text";
import { colors, radius } from "../theme";
import type { MediaResult } from "../types";
import type { SaveFile } from "../download/save";

type Props = {
  result: MediaResult;
  busy: boolean;
  onSave: (files: SaveFile[]) => void;
};

export default function ResultCard({ result, busy, onSave }: Props) {
  const [quality, setQuality] = useState(0);
  const { text, tags } = splitCaption(result.caption);
  const stats = result.stats ?? {};
  const author = result.author;
  const chosen = result.videos[quality];

  const statLine = [
    stats.views !== undefined ? `${formatCount(stats.views)} tayangan` : null,
    stats.likes !== undefined ? `${formatCount(stats.likes)} suka` : null,
    stats.comments !== undefined ? `${formatCount(stats.comments)} komentar` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  const saveVideo = () => {
    if (chosen) {
      onSave([{ url: chosen.url, filename: fileName(result, chosen.ext, chosen.label) }]);
    }
  };

  const saveAudio = () => {
    if (result.audio) {
      onSave([{ url: result.audio.url, filename: fileName(result, result.audio.ext || "mp3") }]);
    }
  };

  const savePhotos = () => {
    onSave(
      result.photos.map((photo, index) => ({
        url: photo.url,
        filename: fileName(result, photo.ext, String(index + 1)),
      }))
    );
  };

  return (
    <View style={styles.card}>
      {result.coverUrl ? (
        <View>
          <Image source={{ uri: result.coverUrl }} style={styles.cover} resizeMode="cover" />
          {result.durationSeconds ? (
            <Text style={styles.badge}>{formatDuration(result.durationSeconds)}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.body}>
        {author?.name || author?.username ? (
          <View style={styles.author}>
            {author.avatarUrl ? (
              <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
            ) : null}
            <View style={styles.flex}>
              <Text style={styles.name} numberOfLines={1}>
                {author.name ?? author.username}
              </Text>
              {author.username ? (
                <Text style={styles.mute} numberOfLines={1}>
                  @{author.username.replace(/^@/, "")}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {text ? (
          <Text style={styles.caption} numberOfLines={5}>
            {text}
          </Text>
        ) : null}

        {tags.length > 0 ? (
          <Text style={styles.tags} numberOfLines={2}>
            {tags.join(" ")}
          </Text>
        ) : null}

        {statLine ? <Text style={styles.mute}>{statLine}</Text> : null}

        {result.kind === "video" && result.videos.length > 1 ? (
          <View style={styles.chips}>
            {result.videos.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setQuality(index)}
                style={[styles.chip, index === quality && styles.chipOn]}
              >
                <Text style={[styles.chipText, index === quality && styles.chipTextOn]}>
                  {item.label}
                  {item.sizeBytes ? ` · ${formatBytes(item.sizeBytes)}` : ""}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          {result.kind === "video" && chosen ? (
            <Button label="Unduh video" busy={busy} onPress={saveVideo} />
          ) : null}
          {result.kind === "photo" && result.photos.length > 0 ? (
            <Button
              label={`Unduh ${result.photos.length} foto`}
              busy={busy}
              onPress={savePhotos}
            />
          ) : null}
          {result.audio ? (
            <Button
              label={result.kind === "audio" ? "Unduh audio" : "Unduh audio saja"}
              busy={busy}
              onPress={saveAudio}
              ghost={result.kind !== "audio"}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function Button({
  label,
  busy,
  onPress,
  ghost,
}: {
  label: string;
  busy: boolean;
  onPress: () => void;
  ghost?: boolean;
}) {
  return (
    <Pressable
      disabled={busy}
      onPress={onPress}
      style={[styles.button, ghost && styles.ghost, busy && styles.disabled]}
    >
      {busy ? (
        <ActivityIndicator color={ghost ? colors.accent : colors.accentText} />
      ) : (
        <Text style={[styles.buttonText, ghost && styles.ghostText]}>{label}</Text>
      )}
    </Pressable>
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
  cover: { width: "100%", aspectRatio: 16 / 10, backgroundColor: colors.chip },
  badge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    color: colors.text,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  body: { padding: 14, gap: 10 },
  author: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.chip },
  flex: { flex: 1 },
  name: { color: colors.text, fontWeight: "600", fontSize: 15 },
  mute: { color: colors.mute, fontSize: 13 },
  caption: { color: colors.text, fontSize: 14, lineHeight: 20 },
  tags: { color: colors.accent, fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextOn: { color: colors.accentText, fontWeight: "600" },
  actions: { gap: 8, marginTop: 4 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
  },
  buttonText: { color: colors.accentText, fontWeight: "700", fontSize: 15 },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.accent },
  ghostText: { color: colors.accent },
  disabled: { opacity: 0.6 },
});
