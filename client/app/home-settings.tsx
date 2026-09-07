import { useRouter } from "expo-router";
import { ArrowLeft, Check, ChevronRight, DoorOpen, Pencil, Users } from "lucide-react-native";
import { useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/components/ui/alert";
import Modal from "@/components/ui/modal";
import { useResponsiveLayout } from "@/lib/useResponsiveLayout";
import { useHome } from "@/stores/homeStore";
import { useI18n } from "@/stores/i18nStore";
import { useTheme } from "@/stores/themeStore";

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "PLN", "UAH", "BYN"];

export default function HomeSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const { alert } = useAlert();
  const { horizontalPadding } = useResponsiveLayout();
  const { home, isAdmin, updateHome } = useHome();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(home?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState<string | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === home?.name) {
      setIsEditingName(false);
      setNameInput(home?.name || "");
      return;
    }
    setIsSavingName(true);
    const result = await updateHome({ name: trimmed });
    setIsSavingName(false);
    if (result.success) {
      setIsEditingName(false);
    } else {
      alert(t.common.error, result.error || "Failed to update home name");
      setNameInput(home?.name || "");
    }
  };

  const handleSelectCurrency = async (currency: string) => {
    if (!isAdmin || currency === home?.currency || isSavingCurrency) return;
    setShowCurrencyModal(false);
    setIsSavingCurrency(currency);
    const result = await updateHome({ currency });
    setIsSavingCurrency(null);
    if (!result.success) {
      alert(t.common.error, result.error || "Failed to update currency");
    }
  };

  if (!home) {
    return (
      <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: theme.background }}>
        <View className="flex-row items-center mb-8 px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-16 justify-center items-center"
            style={{ backgroundColor: theme.surface }}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-base font-manrope" style={{ color: theme.textSecondary }}>
            {t.rooms.joinHomeToManage}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: 40,
          paddingTop: insets.top + 16,
          width: "100%",
          maxWidth: 960,
          alignSelf: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            className="w-12 h-12 rounded-16 justify-center items-center"
            style={{ backgroundColor: theme.surface }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-manrope-bold text-center" style={{ color: theme.text }}>
            {t.profile.homeSettings}
          </Text>
          <View className="w-12" />
        </View>

        {/* Home Name */}
        <View className="mb-8">
          <Text
            className="text-xs font-manrope-bold mb-3 ml-1"
            style={{ color: theme.textSecondary, letterSpacing: 1 }}
          >
            {t.settings.homeName || "Home Name"}
          </Text>
          <View className="flex-row items-center p-5 rounded-20 gap-3" style={{ backgroundColor: theme.surface }}>
            {isEditingName ? (
              <>
                <TextInput
                  ref={nameInputRef}
                  className="flex-1 text-base font-manrope-semibold"
                  style={{ color: theme.text }}
                  value={nameInput}
                  onChangeText={setNameInput}
                  onSubmitEditing={saveName}
                  onBlur={saveName}
                  autoFocus
                  maxLength={100}
                  editable={!isSavingName}
                />
                {isSavingName ? (
                  <ActivityIndicator size="small" color={theme.accent.purple} />
                ) : (
                  <TouchableOpacity onPress={saveName}>
                    <Check size={20} color={theme.accent.mint} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text className="flex-1 text-base font-manrope-semibold" style={{ color: theme.text }}>
                  {home.name}
                </Text>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => {
                      setNameInput(home.name);
                      setIsEditingName(true);
                    }}
                  >
                    <Pencil size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Currency */}
        <View className="mb-8">
          <Text
            className="text-xs font-manrope-bold mb-3 ml-1"
            style={{ color: theme.textSecondary, letterSpacing: 1 }}
          >
            {t.settings.currency || "CURRENCY"}
          </Text>
          <TouchableOpacity
            className="flex-row items-center p-5 rounded-20 gap-3"
            style={{ backgroundColor: theme.surface }}
            onPress={() => isAdmin && setShowCurrencyModal(true)}
            disabled={!isAdmin}
            activeOpacity={0.7}
          >
            <Text className="flex-1 text-base font-manrope-semibold" style={{ color: theme.text }}>
              {(home.currency || "USD").toUpperCase()}
            </Text>
            {isSavingCurrency ? (
              <ActivityIndicator size="small" color={theme.accent.purple} />
            ) : (
              isAdmin && <ChevronRight size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Links */}
        <View className="mb-8 gap-3">
          <TouchableOpacity
            className="flex-row items-center p-4 rounded-20 gap-3.5"
            style={{ backgroundColor: theme.surface }}
            onPress={() => router.push("/members")}
          >
            <View
              className="w-11 h-11 rounded-14 justify-center items-center"
              style={{ backgroundColor: theme.accent.mint }}
            >
              <Users size={20} color="#1C1C1E" />
            </View>
            <Text className="flex-1 text-base font-manrope-semibold" style={{ color: theme.text }}>
              {t.members.title}
            </Text>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-20 gap-3.5"
            style={{ backgroundColor: theme.surface }}
            onPress={() => router.push("/rooms")}
          >
            <View
              className="w-11 h-11 rounded-14 justify-center items-center"
              style={{ backgroundColor: theme.accent.yellow }}
            >
              <DoorOpen size={20} color="#1C1C1E" />
            </View>
            <Text className="flex-1 text-base font-manrope-semibold" style={{ color: theme.text }}>
              {t.rooms.title}
            </Text>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title={t.settings.currency || "Currency"}
        height="full"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {CURRENCY_OPTIONS.map((currency) => {
            const isSelected = currency === (home.currency || "USD").toUpperCase();
            return (
              <TouchableOpacity
                key={currency}
                className="p-4.5 rounded-16 mb-2.5"
                style={{ backgroundColor: isSelected ? theme.accent.purple : theme.surface }}
                onPress={() => handleSelectCurrency(currency)}
              >
                <Text className="text-17 font-manrope-semibold" style={{ color: isSelected ? "#1C1C1E" : theme.text }}>
                  {currency}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Modal>
    </View>
  );
}
