import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { ApiError, resolveLink } from "../api/client";
import ResultCard from "../components/ResultCard";
import { saveOne, type SaveFile } from "../download/save";
import { colors, radius } from "../theme";
import type { MediaResult } from "../types";

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<MediaResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const show = (text: string | null, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const paste = async () => {
    const text = await Clipboard.getStringAsync();

    if (text.trim()) {
      setInput(text.trim());
    }
  };

  const fetchResult = async (link: string) => {
    const data = await resolveLink(link);

    setResult(data);

    return data;
  };

  const submit = async () => {
    const link = input.trim();

    if (!link || loading) {
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setResult(null);
    show(null);

    try {
      await fetchResult(link);
    } catch (error) {
      show(error instanceof ApiError ? error.message : "Terjadi kesalahan.", true);
    } finally {
      setLoading(false);
    }
  };

  const save = async (files: SaveFile[]) => {
    if (!result || saving) {
      return;
    }

    setSaving(true);

    let done = 0;

    for (let index = 0; index < files.length; index += 1) {
      show(
        files.length > 1
          ? `Mengunduh ${index + 1} dari ${files.length}...`
          : "Mengunduh..."
      );

      const outcome = await saveOne(files[index]);

      if (!outcome.ok && outcome.expired) {
        try {
          await fetchResult(result.sourceUrl);
          show("Link kedaluwarsa, sudah diperbarui. Tekan unduh sekali lagi.", true);
        } catch {
          show(outcome.message, true);
        }

        setSaving(false);
        return;
      }

      if (!outcome.ok) {
        show(outcome.message, true);
        setSaving(false);
        return;
      }

      done += 1;
    }

    show(`${done} file tersimpan di album Orbit.`);
    setSaving(false);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Orbit</Text>
        <Text style={styles.sub}>Tempel link, unduh ke galeri.</Text>

        <View style={styles.row}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="https://..."
            placeholderTextColor={colors.mute}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={submit}
            style={styles.input}
          />
          <Pressable onPress={paste} style={styles.side}>
            <Text style={styles.sideText}>Tempel</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={submit}
          disabled={loading || !input.trim()}
          style={[styles.go, (loading || !input.trim()) && styles.off]}
        >
          {loading ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text style={styles.goText}>Ambil media</Text>
          )}
        </Pressable>

        {message ? (
          <Text style={[styles.message, isError && styles.error]}>{message}</Text>
        ) : null}

        {result ? <ResultCard result={result} busy={saving} onSave={save} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: RNStatusBar.currentHeight ?? 40,
  },
  scroll: { padding: 20, gap: 14, paddingBottom: 48 },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  sub: { color: colors.mute, fontSize: 14, marginBottom: 6 },
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  side: {
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sideText: { color: colors.text, fontWeight: "600" },
  go: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  goText: { color: colors.accentText, fontWeight: "700", fontSize: 16 },
  off: { opacity: 0.5 },
  message: { color: colors.ok, fontSize: 14 },
  error: { color: colors.bad },
});
