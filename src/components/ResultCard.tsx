import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { absolute } from "../config";
import { fileName } from "../lib/filename";
import { formatBytes } from "../lib/bytes";
import { formatCount, formatDuration, splitCaption } from "../lib/text";
import { colors, radius } from "../theme";
import type { MediaResult } from "../types";
import type { SaveFile } from "../download/save";
import PrimaryButton from "./PrimaryButton";

type Props = {
  result: MediaResult;
  busy: boolean;
  onSave: (files: SaveFile[]) => void;
};

function Stat({ label, value }: { label: string; value?: number }) {
  if (value === undefined) {
    return null;
  }

  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{formatCount(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ResultCard({ result, busy, onSave }: Props) {
  const [quality, setQuality] = useState(0);
  const { text, tags } = splitCaption(result.caption);
  const stats = result.stats ?? {};
  const author = result.author;
  const chosen = result.videos[quality];
  const cover = result.coverUrl ?? result.photos[0]?.thumbnailUrl ?? result.photos[0]?.url;

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
      {cover ? (
        <View>
          <Image source={{ uri: absolute(cover) }} style={styles.cover} resizeMode="cover" />
          {result.durationSeconds ? (
            <Text style={styles.badge}>{formatDuration(result.durationSeconds)}</Text>
          ) : null}
          {result.kind === "photo" && result.photos.length > 1 ? (
            <Text style={styles.badge}>{result.photos.length} foto</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.body}>
        {author?.name || author?.username ? (
          <View style={styles.author}>
            {author.avatarUrl ? (
              <Image source={{ uri: absolute(author.avatarUrl) }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View style={styles.flex}>
              <Text style={styles.name} numberOfLines={1}>
                {author.name ?? author.username}
              </Text>
              {author.username ? (
                <Text style={styles.mute} numberOfLines={1}>
                  @{author.username.replace(/^@/, "")}
                  {author.followers !== undefined
                    ? ` · ${formatCount(author.followers)} pengikut`
                    : ""}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.stats}>
          <Stat label="Tayangan" value={stats.views} />
          <Stat label="Suka" value={stats.likes} />
          <Stat label="Komentar" value={stats.comments} />
          <Stat label="Bagikan" value={stats.shares} />
          <Stat label="Simpan" value={stats.saves} />
        </View>

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
            <PrimaryButton label="Unduh video" busy={busy} onPress={saveVideo} />
          ) : null}
          {result.kind === "photo" && result.photos.length > 0 ? (
            <PrimaryButton
              label={`Unduh ${result.photos.length} foto`}
              busy={busy}
              onPress={savePhotos}
            />
          ) : null}
          {result.audio ? (
            <PrimaryButton
              label={result.kind === "audio" ? "Unduh audio" : "Unduh audio saja"}
              busy={busy}
              onPress={saveAudio}
            />
          ) : null}
        </View>
      </View>
    </View>
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
  badge: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    color: colors.text,
    fontSize: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  body: { padding: 16, gap: 14 },
  author: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.chip },
  flex: { flex: 1 },
  name: { color: colors.text, fontWeight: "700", fontSize: 16 },
  mute: { color: colors.mute, fontSize: 13 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: {
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 78,
  },
  statValue: { color: colors.text, fontWeight: "700", fontSize: 15 },
  statLabel: { color: colors.mute, fontSize: 11, marginTop: 1 },
  caption: { color: colors.soft, fontSize: 14, lineHeight: 21 },
  tags: { color: colors.mute, fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextOn: { color: colors.accentText, fontWeight: "700" },
  actions: { gap: 10, marginTop: 2 },
});
