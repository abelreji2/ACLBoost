import * as React from "react";
import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View, Platform, Keyboard } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if(!emailAddress || !password) {
        alert("Please enter both email and password");
        return;
    }

    console.log(emailAddress, password);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    if(!code) {
        alert("Please enter the verification code");
        return;
    }

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
  <SafeAreaView className="flex-1 bg-white">
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
            <Ionicons name="mail" size={48} color="white" />
          </View>
          <Text className="text-3xl font-bold text-black mb-2">
            Check your email
          </Text>
          <Text className="text-lg text-black text-center">
            We've sent a verification code to {"\n"} {emailAddress}
          </Text>
        </View>
        {/* Verification Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="mb-2 font-bold text-lg text-center">Verification Code</Text>
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 mb-4">
                <Ionicons name="key" size={20} color="gray" />
                <TextInput
                    value={code}
                    placeholder="Enter 6-digit code"
                    onChangeText={setCode}
                    className="flex-1 ml-3 text-gray-900 "
                    editable={isLoaded}
                />
            </View>
          <TouchableOpacity 
          onPress={onVerifyPress} 
          className="rounded-xl py-4 shadow-sm mb-4 bg-green-600"
          disabled={!isLoaded}
          activeOpacity={0.8}
          >
            <View className = "flex-row justify-center items-center">
                <Ionicons name="checkmark" size={20} color="white" />
                <Text className="text-white text-center font-semibold text-lg ml-2">Verify Email</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
  }

  return (
    <SafeAreaView className = "flex-1 bg-blue-100">
    <KeyboardAvoidingView
        behavior = {Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={120}
        >

        <View className="flex-1 px-6 mt-20">
            <View className="items-center mb-8">
                <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                    <Ionicons name="accessibility-outline" size={48} color="red" />
                </View>
                <Text className="text-3xl font-bold text-red-600 mb-2">
                    Join ACL Tracker
                </Text>
                <Text className="text-lg text-black text-center">
                     Take a big step towards ACL Recovery{"\n"} and stay consistent
                </Text>
            </View>

            <View className="bg-white rounded-2xl p-6 shadow-sm border border-black mb-6 mt-4">
                <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</Text>

                {/*Email*/}
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

                {/*Password*/}
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 mt-4">
                    <Ionicons name="lock-closed" size={20} color="gray" />
                    <TextInput
                        secureTextEntry
                        value={password}
                        placeholder="Enter password"
                        placeholderTextColor={"gray"}
                        onChangeText={setPassword}
                        className="flex-1 ml-3 text-gray-900"
                        editable={isLoaded}
                    />
                </View>

                {/*Create Account Button*/}
                <TouchableOpacity
                onPress={onSignUpPress}
                className="bg-blue-600 py-4 shadow-sm rounded-xl py-2 items-center mb-4 mt-4"
                disabled={!isLoaded}
                activeOpacity={0.8}
                >
                    <View className = "flex-row justify-center items-center">
                    <Ionicons name="person-add-outline" size={20} color="white" />
                    <Text className="text-white font-semibold text-lg ml-2">Create Account</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View className = "flex-row justify-center items-center mt-8">
                <Text className="text-gray-600 font-semibold">Already have an account? </Text>
                <Link href="/sign-in" asChild>
                    <TouchableOpacity>
                    <Text className="text-blue-600 font-semibold">Sign in</Text>
                    </TouchableOpacity> 
                </Link>
            </View>


        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}
