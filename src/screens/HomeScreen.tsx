import { useEffect, useRef, useState } from "react";
import {
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
import { ApiError, loadDetails, resolveBase } from "../api/client";
import { getToken } from "../api/device";
import GradientBox from "../components/GradientBox";
import Logo from "../components/Logo";
import PlatformRow from "../components/PlatformRow";
import PrimaryButton from "../components/PrimaryButton";
import ResultCard from "../components/ResultCard";
import Skeleton from "../components/Skeleton";
import { saveOne, type SaveFile } from "../download/save";
import { colors, radius } from "../theme";
import type { MediaResult } from "../types";

const HOSTS: Array<[RegExp, string]> = [
  [/tiktok\.com/i, "tiktok"],
  [/instagram\.com/i, "instagram"],
  [/youtu(\.be|be\.com)/i, "youtube"],
  [/(^|\/\/|\.)(x|twitter)\.com/i, "x"],
  [/threads\.(net|com)/i, "threads"],
  [/pinterest\.|pin\.it/i, "pinterest"],
  [/spotify\.com|spotify\.link/i, "spotify"],
];

function detect(value: string) {
  for (const [pattern, id] of HOSTS) {
    if (pattern.test(value)) {
      return id;
    }
  }

  return null;
}

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<MediaResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const run = useRef(0);

  useEffect(() => {
    void getToken();
  }, []);

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
    const id = (run.current += 1);
    const base = await resolveBase(link);

    if (id !== run.current) {
      return base;
    }

    setResult(base);

    if (base.detailsPending) {
      void loadDetails(link, base).then((full) => {
        if (id === run.current) {
          setResult(full);
        }
      });
    }

    return base;
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
          : "Mengunduh, mohon tunggu..."
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

  const active = detect(input);
  const hasInput = input.trim().length > 0;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Logo size={60} />
          <Text style={styles.title}>Orbit Media</Text>
          <Text style={styles.sub}>Download media dari berbagai platform</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <GradientBox radius={22}>
              <View style={styles.urlInner}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Tempel link di sini"
                  placeholderTextColor={colors.dim}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                  style={styles.input}
                />
                {hasInput ? (
                  <Pressable onPress={() => setInput("")} hitSlop={10}>
                    <Text style={styles.clear}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            </GradientBox>
          </View>
          <Pressable onPress={paste} style={styles.paste}>
            <Text style={styles.pasteText}>Tempel</Text>
          </Pressable>
        </View>

        <PrimaryButton
          label="Ambil media"
          onPress={submit}
          busy={loading}
          disabled={!hasInput}
        />

        {message ? (
          <Text style={[styles.message, isError && styles.error]}>{message}</Text>
        ) : null}

        {loading ? <Skeleton /> : null}

        {result ? <ResultCard result={result} busy={saving} onSave={save} /> : null}

        {!loading && !result ? <PlatformRow active={active} /> : null}
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
  scroll: { padding: 20, gap: 16, paddingBottom: 48 },
  hero: { alignItems: "center", gap: 8, marginTop: 12, marginBottom: 14 },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  sub: { color: colors.mute, fontSize: 14, textAlign: "center" },
  row: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  flex: { flex: 1 },
  urlInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 20.5,
    paddingHorizontal: 16,
    minHeight: 54,
    gap: 8,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  clear: { color: colors.mute, fontSize: 16 },
  paste: {
    borderWidth: 1,
    borderColor: "rgba(235,238,245,0.24)",
    borderRadius: radius.md,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: colors.fill,
  },
  pasteText: { color: colors.text, fontWeight: "600", fontSize: 14 },
  message: { color: colors.ok, fontSize: 14 },
  error: { color: colors.bad },
});
