import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
  Touchable,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GoogleSignIn from "../components/GoogleSignIn";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      alert("Please enter both email and password");
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          <View className="flex-1 justify-center px-4">
            {/* Logo/Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="fitness" size={48} color="red" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                ACL Tracker
              </Text>
              <Text className="text-lg text-gray-600 text-center">
                Stay consistent with ACL Recovery{"\n"} and reach your goals
              </Text>
            </View>

            {/* Form */}
            <View className="mb-4">
              <Text className="text-sm font-mecdium text-gray-700 mb-2">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="mail" size={20} color="gray" />
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter email"
                  placeholderTextColor={"gray"}
                  onChangeText={setEmailAddress}
                  className="flex-1 ml-3 text-gray-900"
                  editable={isLoaded}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-mecdium text-gray-700 mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="lock-closed" size={20} color="gray" />
                <TextInput
                  value={password}
                  placeholder="Enter password"
                  placeholderTextColor={"gray"}
                  secureTextEntry={true}
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-gray-900"
                  editable={isLoaded}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={onSignInPress}
              className="bg-blue-600 rounded py-2 items-center mb-4"
              disabled={!isLoaded}
            >
              <Text className="text-white font-bold">Sign In</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-4 text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>
            <GoogleSignIn />
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
