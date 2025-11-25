import { View, Text, Touchable, TouchableOpacity, Image } from "react-native";
import React from "react";
// Update the import to use the correct type name, e.g. 'Exercise' instead of 'Exercises'
import { Exercises } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/client";

interface ExerciseCardProps {
  item: Exercises;
  onPress: () => void;
  showChevron?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "post-op":
      return "red";
    case "control":
      return "yellow";
    case "intermediate":
      return "orange";
    case "advanced":
      return "blue";
    case "athletic":
      return "purple";
    default:
      return "gray";
  }
};

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case "post-op":
      return "Post-op";
    case "control":
      return "Control";
    case "intermediate":
      return "Intermediate Strengthening";
    case "advanced":
      return "Advanced Strengthening";
    case "athletic":
      return "Athletic";
    default:
      return "gray";
  }
};

const ExerciseCard = ({ item, onPress, showChevron }: ExerciseCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg shadow-sm mb-4 border border-gray-100 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row p-4">
        {/* Image container - left side */}
        <View
          className="mr-4 rounded-lg overflow-hidden"
          style={{
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.05)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          {item.image ? (
            <Image
              source={{
                uri: urlFor(item.image?.asset?._ref)
                  .width(100)
                  .height(100)
                  .url(),
              }}
              className="w-20 h-20"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 bg-blue-50 items-center justify-center">
              <Text className="text-blue-400 text-3xl">🏋️</Text>
            </View>
          )}
        </View>

        {/* Content with improved typography and spacing */}
        <View className="flex-1 justify-between py-0.5">
          <View>
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              className="text-gray-500 text-sm mt-0.5 mb-2"
              numberOfLines={1}
            >
              {item.muscleGroup}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            {/* Improved difficulty badge */}
            <View
              className={
                item.difficulty === "post-op"
                  ? "bg-red-100 px-3 py-1 rounded-full border border-red-200"
                  : item.difficulty === "control"
                  ? "bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200"
                  : item.difficulty === "intermediate"
                  ? "bg-orange-100 px-3 py-1 rounded-full border border-orange-200"
                  : item.difficulty === "advanced"
                  ? "bg-blue-100 px-3 py-1 rounded-full border border-blue-200"
                  : item.difficulty === "athletic"
                  ? "bg-purple-100 px-3 py-1 rounded-full border border-purple-200"
                  : "bg-gray-100 px-3 py-1 rounded-full border border-gray-200"
              }
            >
              <Text
                className={
                  item.difficulty === "post-op"
                    ? "text-xs font-medium text-red-700"
                    : item.difficulty === "control"
                    ? "text-xs font-medium text-yellow-700"
                    : item.difficulty === "intermediate"
                    ? "text-xs font-medium text-orange-700"
                    : item.difficulty === "advanced"
                    ? "text-xs font-medium text-red-700"
                    : item.difficulty === "athletic"
                    ? "text-xs font-medium text-purple-700"
                    : "text-xs font-medium text-gray-700"
                }
              >
                {getDifficultyText(item.difficulty)}
              </Text>
            </View>

            {/* Better chevron styling */}
            {showChevron && (
              <View className="ml-2 h-8 w-8 rounded-full bg-gray-50 items-center justify-center">
                <Text className="text-gray-400">→</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseCard;
