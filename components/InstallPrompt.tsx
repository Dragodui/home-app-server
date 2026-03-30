import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Download, X } from "lucide-react-native";
import { useTheme } from "@/stores/themeStore";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || Platform.OS !== "web") return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
  };

  return (
    <View
      className={`absolute bottom-6 left-4 right-4 z-50 flex-row items-center rounded-2xl px-4 py-3 shadow-lg ${
        theme.isDark ? "bg-surface-dark" : "bg-white"
      }`}
      style={{ elevation: 8 }}
    >
      <Download size={20} color={theme.accent.primary} />
      <Text
        className={`ml-3 flex-1 text-sm font-semibold ${
          theme.isDark ? "text-text-dark" : "text-text"
        }`}
      >
        Install app for a better experience
      </Text>
      <Pressable
        onPress={handleInstall}
        className="ml-2 rounded-xl px-4 py-2"
        style={{ backgroundColor: theme.accent.primary }}
      >
        <Text className="text-sm font-bold text-white">Install</Text>
      </Pressable>
      <Pressable onPress={handleDismiss} className="ml-2 p-1">
        <X size={18} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}
