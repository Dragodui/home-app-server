import * as SecureStore from "expo-secure-store";

/**
 * Wrapper around expo-secure-store for sensitive data (auth token, user info).
 * Non-sensitive preferences (theme, language, home ID) should continue using AsyncStorage.
 */
export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};
