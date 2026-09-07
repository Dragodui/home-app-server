import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useResponsiveLayout } from "@/lib/useResponsiveLayout";
import { useAuth } from "@/stores/authStore";
import { useI18n } from "@/stores/i18nStore";
import { useTheme } from "@/stores/themeStore";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();
  const { theme } = useTheme();
  const { t } = useI18n();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { horizontalPadding } = useResponsiveLayout();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t.auth.invalidResetToken);
    }
  }, [token, t]);

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!password || !confirmPassword) {
      setError(t.auth.fillAllFields);
      return;
    }

    if (password.length < 8) {
      setError(t.auth.passwordMinLength8);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.security.passwordsMismatch);
      return;
    }

    if (!token) {
      setError(t.auth.invalidResetToken);
      return;
    }

    setIsLoading(true);

    const result = await resetPassword(token, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || t.auth.failedToResetPassword);
    }
  };

  if (success) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background, paddingTop: insets.top }}>
        <View
          className="flex-1 justify-center items-center"
          style={{ paddingHorizontal: horizontalPadding, width: "100%", maxWidth: 640, alignSelf: "center" }}
        >
          <View
            className="w-[120px] h-[120px] rounded-full justify-center items-center mb-8"
            style={{ backgroundColor: `${theme.accent.green}20` }}
          >
            <CheckCircle size={64} color={theme.accent.green} />
          </View>
          <Text className="text-[28px] font-manrope-bold mb-4 text-center" style={{ color: theme.text }}>
            {t.auth.passwordResetTitle}
          </Text>
          <Text className="text-base font-manrope text-center leading-6 mb-8" style={{ color: theme.textSecondary }}>
            {t.auth.passwordResetSuccessText}
          </Text>
          <Button
            title={t.auth.goToLogin}
            onPress={() => router.replace("/login")}
            variant="purple"
            className="w-full"
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: horizontalPadding,
          paddingTop: insets.top + 16,
          width: "100%",
          maxWidth: 640,
          alignSelf: "center",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          className="w-12 h-12 rounded-2xl justify-center items-center mb-8"
          style={{ backgroundColor: theme.surface }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <View className="mb-12">
          <View
            className="w-20 h-20 rounded-3xl justify-center items-center mb-6"
            style={{ backgroundColor: theme.accent.purple }}
          >
            <Lock size={40} color={theme.background} />
          </View>
          <Text className="text-[32px] font-manrope-bold mb-3" style={{ color: theme.text }}>
            {t.auth.resetPasswordTitle}
          </Text>
          <Text className="text-base font-manrope leading-6" style={{ color: theme.textSecondary }}>
            {t.auth.resetPasswordDescription}
          </Text>
        </View>

        <View className="flex-1">
          <Input
            label={t.security.newPassword}
            placeholder={t.security.newPasswordPlaceholder}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            secureTextEntry
            autoCapitalize="none"
            error={error && !confirmPassword ? error : undefined}
          />

          <Input
            label={t.security.confirmPassword}
            placeholder={t.security.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError("");
            }}
            secureTextEntry
            autoCapitalize="none"
            error={error && confirmPassword ? error : undefined}
          />

          <Button
            title={t.auth.resetPasswordTitle}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading || !password || !confirmPassword || !token}
            variant="purple"
            className="mt-4"
          />
        </View>

        <View className="flex-row justify-center items-center pt-6" style={{ paddingBottom: insets.bottom + 24 }}>
          <Text className="text-sm font-manrope" style={{ color: theme.textSecondary }}>
            {t.auth.rememberYourPassword}{" "}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text className="text-sm font-manrope-bold underline" style={{ color: theme.text }}>
              {t.auth.logIn}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
