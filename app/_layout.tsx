if (__DEV__) {
  require("../ReactotronConfig");
}

import React from "react";
import { StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { useFonts } from "expo-font";
import { fontsToLoad } from "@/theme/typography";
import { Stack } from "expo-router/stack";
import { ClerkProvider } from "@clerk/clerk-expo";

import * as SecureStore from "expo-secure-store";

const tokenCache = {
  getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return null;
    }
  },
};

const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const unstable_settings = {
  initialRouteName: "home",
};

export default function Layout() {
  let [fontsLoaded] = useFonts(fontsToLoad);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider
      publishableKey={clerkKey!}
      // tokenCache={tokenCache as any}
    >
      <Stack screenOptions={{ contentStyle: styles.$stackContainerStyle }}>
        <Stack.Screen
          options={{ headerShown: false }}
          name="index"
        />
        <Stack.Screen
          name="home"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerBackVisible: false,
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerBackVisible: false,
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="forgot_password"
          options={{
            headerBackVisible: false,
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="otp_verification"
          options={{
            headerBackVisible: false,
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  $stackContainerStyle: { backgroundColor: colors.neutral100 },
});
