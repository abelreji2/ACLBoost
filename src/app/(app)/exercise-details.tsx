import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { urlFor, client } from "@/lib/sanity/client";
import { Exercises } from "sanity/sanity.types";
import { defineQuery } from "groq";
import Markdown from "react-native-markdown-display";

const singleExerciseQuery = defineQuery(
  `*[_type == "exercises" && _id == $id][0]`
);

const ExerciseDetails = () => {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [exercises, setExercise] = React.useState<Exercises>(null);
  const [loading, setLoading] = React.useState(true);
  const [aiGuidance, setAiGuidance] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const exerciseData = await client.fetch(singleExerciseQuery, { id });
        setExercise(exerciseData);
      } catch (error) {
        console.error("Error fetching exercise:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getAiGuidance = async () => {
    if (!exercises) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercises.name }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetchAI guidance");
      }
      const data = await response.json();
      setAiGuidance(data.message);
    } catch (error) {
      console.error("Error fetching AI guidance:", error);
      setAiGuidance("Failed to load AI guidance.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="default" />

      {/* Header */}
      <View className="absolute top-0 left-0 right-0 bg-white h-16 border-b border-gray-200 z-10 flex-row items-center justify-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 h-9 w-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Exercise Details</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading exercise details...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingTop: 70, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          className="px-5 bg-white"
        >
          {/* Image Section */}
          {exercises?.image ? (
            <View className="overflow-hidden rounded-xl mb-6 shadow-sm border border-gray-100">
              <Image
                source={{
                  uri: urlFor(exercises.image.asset._ref).url(),
                }}
                className="w-full h-56"
                resizeMode="contain"
              />
            </View>
          ) : (
            <View className="w-full h-72 bg-blue-50 rounded-xl items-center justify-center mb-6 shadow-sm border border-gray-100">
              <Text className="text-blue-400 text-7xl mb-2">🏋️</Text>
              <Text className="text-blue-400 font-medium">
                No image available
              </Text>
            </View>
          )}

          {/* Title and Basic Info */}
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {exercises?.name}
          </Text>

          {/* Muscle Group & Difficulty Tags */}
          <View className="flex-row mb-6">
            {exercises?.muscleGroup && (
              <View className="bg-blue-100 px-3 py-1 rounded-full mr-2">
                <Text className="text-blue-700 font-medium">
                  {exercises.muscleGroup}
                </Text>
              </View>
            )}

            {exercises?.difficulty && (
              <View
                className={
                  exercises.difficulty === "post-op"
                    ? "bg-red-100 px-4 py-1.5 rounded-full border border-red-200 flex items-center justify-center"
                    : exercises.difficulty === "control"
                    ? "bg-yellow-100 px-4 py-1.5 rounded-full border border-yellow-200 flex items-center justify-center"
                    : exercises.difficulty === "intermediate"
                    ? "bg-orange-100 px-4 py-1.5 rounded-full border border-orange-200 flex items-center justify-center"
                    : exercises.difficulty === "advanced"
                    ? "bg-blue-100 px-4 py-1.5 rounded-full border border-blue-200 flex items-center justify-center"
                    : exercises.difficulty === "athletic"
                    ? "bg-purple-100 px-4 py-1.5 rounded-full border border-purple-200 flex items-center justify-center"
                    : "bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200 flex items-center justify-center"
                }
              >
                <Text
                  className={
                    exercises.difficulty === "post-op"
                      ? "text-red-700 font-medium capitalize text-sm leading-none"
                      : exercises.difficulty === "control"
                      ? "text-yellow-700 font-medium capitalize text-sm leading-none"
                      : exercises.difficulty === "intermediate"
                      ? "text-orange-700 font-medium capitalize text-sm leading-none"
                      : exercises.difficulty === "advanced"
                      ? "text-blue-700 font-medium capitalize text-sm leading-none"
                      : exercises.difficulty === "athletic"
                      ? "text-purple-700 font-medium capitalize text-sm leading-none"
                      : "text-gray-700 font-medium capitalize text-sm leading-none"
                  }
                >
                  {exercises.difficulty}
                </Text>
              </View>
            )}
          </View>

          {/* Description Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </Text>
            <Text className="text-gray-700 leading-6">
              {exercises?.description || "No description available"}
            </Text>
          </View>

          {/* Instructions Section with shadow card */}
          <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={22} color="#3b82f6" />
              <Text className="text-lg font-semibold text-gray-800 ml-2">
                How to perform
              </Text>
            </View>
            <Text className="text-gray-700 leading-6">
              {exercises?.instruction ||
                "Start by positioning yourself correctly. Maintain proper form throughout the exercise to prevent injuries and maximize results."}
            </Text>
          </View>

          <View>
            {/* Video Link If Available */}
            {exercises?.videoUrl && (
              <TouchableOpacity
                className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center mb-6"
                onPress={() => {
                  Linking.openURL(exercises.videoUrl);
                }}
              >
                <Ionicons
                  name="play-circle"
                  size={24}
                  color="white"
                  className="mr-2"
                />
                <Text className="text-white font-bold ml-2">
                  Watch Tutorial Video
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`rounded-xl p-4 flex-row items-center justify-center mb-6 ${
                aiLoading
                  ? "bg-gray-300"
                  : aiGuidance
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
              onPress={getAiGuidance}
              disabled={aiLoading}
            >
              <Ionicons
                name={aiGuidance ? "checkmark-circle" : "bulb-outline"}
                size={24}
                color="white"
                className="mr-2"
              />
              <Text className="text-white font-bold ml-2">
                {aiGuidance ? "AI Guidance Generated" : "Generate AI Guidance"}
              </Text>
            </TouchableOpacity>

            {/* AI Guidance Section */}
            {(aiGuidance || aiLoading) && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="person-outline" size={22} color="#10b981" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">
                    AI Guidance
                  </Text>
                </View>
                {aiLoading ? (
                  <View className="p-4 bg-gray-100 rounded-xl items-center justify-center mb-6">
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text>Getting AI Guidance</Text>
                  </View>
                ) : (
                  <View className="mt-2 gap-2">
                    <Markdown
                      style={{
                        body: {
                          paddingBottom: 20,
                        },
                        heading2: {
                          fontSize: 18,
                          fontWeight: "600",
                          color: "#111827",
                          marginTop: 10,
                          marginBottom: 4,
                        },
                        heading3: {
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                          marginTop: 8,
                          marginBottom: 4,
                        },
                      }}
                    >
                      {aiGuidance}
                    </Markdown>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ExerciseDetails;
