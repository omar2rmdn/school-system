import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import axios, { isAxiosError } from "axios";
import { Href, router } from "expo-router";
import { useAuthStore } from "@/store";
import { LoginResponse } from "@/types";
import { SafeView } from "@/components/common/safe-view";
import { BASE_URL } from "@/lib/api";

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return setError("Email and password are required.");
    }

    try {
      setIsLoading(true);
      setError("");

      const { data } = await axios.post<LoginResponse>(
        `${BASE_URL}/users/login`,
        { email: email.trim().toLowerCase(), password },
      );

      login(data.data);
      router.replace(`/(main)/${data.data.user.role}/(tabs)/home` as Href);
    } catch (err) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : null;
      setError(msg || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-center px-6 py-10"
        >
          {/* Header Section */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-500">
              Sign in to your school account
            </Text>
          </View>

          {/* Form Section */}
          <View>
            {/* Email Input */}
            <View className="mb-4">
              <Text className="mb-1 text-sm font-medium text-gray-700">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="name@school.edu"
                placeholderTextColor="#9ca3af" // Tailwind gray-400
                value={email}
                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3.5 text-base text-gray-900"
              />
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700">
                  Password
                </Text>
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Text className="text-sm font-medium text-blue-600">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3.5 text-base text-gray-900"
              />
            </View>

            {/* Error Message */}
            {!!error && (
              <Text className="mb-4 text-sm text-red-500 font-medium">
                {error}
              </Text>
            )}

            {/* Submit Button */}
            <Pressable
              disabled={isLoading}
              onPress={handleLogin}
              className={`items-center rounded-lg py-4 ${
                isLoading ? "bg-blue-400" : "bg-blue-600"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Sign In
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}
