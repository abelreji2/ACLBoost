import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

function Workout() {
  const router = useRouter();
  const { user } = useUser();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularExercises, setPopularExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  const startWorkout = (templateId = null) => {
    router.push({
      pathname: "/(app)/(tabs)/active-workout",
      params: { templateId },
    });
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  useEffect(() => {
    // Mock data - replace with actual data fetching
    setTimeout(() => {
      setRecentWorkouts([
        {
          id: "1",
          name: "Full Body Workout",
          date: new Date(Date.now() - 86400000 * 2),
          duration: 45,
        },
        {
          id: "2",
          name: "Upper Body Focus",
          date: new Date(Date.now() - 86400000 * 5),
          duration: 35,
        },
      ]);
      setLoading(false);
    }, 1000);

    setTimeout(() => {
      setPopularExercises([
        { id: "1", name: "Leg Raises", muscleGroup: "Quadriceps" },
        { id: "2", name: "Glute Bridges", muscleGroup: "Glutes" },
        { id: "3", name: "Wall Sits", muscleGroup: "Quadriceps" },
      ]);
      setLoadingExercises(false);
    }, 800);
  }, []);

  const goToExerciseLibrary = () => {
    router.push('/(app)/(tabs)/exercises');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Workouts</Text>
        <TouchableOpacity
          className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center"
          onPress={() => router.push("/(app)/(tabs)/profile")}
        >
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Ionicons name="person" size={20} color="#3b82f6" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Start Section */}
        <View className="px-5 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Quick Start
          </Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-xl p-5 flex-row items-center shadow-sm"
            onPress={() => startWorkout()}
            activeOpacity={0.8}
          >
            <View className="bg-blue-400 rounded-full p-3 mr-4">
              <Ionicons name="add" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                Start Workout
              </Text>
              <Text className="text-blue-100">Personalize your recovery</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-2 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Exercise Library
            </Text>
            <TouchableOpacity onPress={goToExerciseLibrary}>
              <Text className="text-blue-500 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {loadingExercises ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : (
            <View>
              {popularExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  className="flex-row items-center py-3 border-b border-gray-100"
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/exercise-details",
                      params: { id: exercise.id },
                    })
                  }
                >
                  <View className="bg-blue-100 h-10 w-10 rounded-md items-center justify-center mr-4">
                    <Ionicons
                      name="barbell-outline"
                      size={18}
                      color="#3b82f6"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {exercise.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {exercise.muscleGroup}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="mt-3 py-4 bg-gray-100 rounded-xl items-center flex-row justify-center"
                onPress={goToExerciseLibrary}
              >
                <Ionicons name="search" size={18} color="#4b5563" />
                <Text className="text-gray-700 font-medium ml-2">
                  Browse All Exercises
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

  {/* Replace the Body Stats section with this big icon */}
<View className="items-center justify-center py-8 mb-8">
  <View className="bg-blue-100 h-24 w-24 rounded-full items-center justify-center shadow-sm">
    <Ionicons name="body-outline" size={48} color="#3b82f6" />
  </View>
  <Text className="text-gray-900 font-medium text-lg mt-3">Ready to train?</Text>
  <TouchableOpacity 
    className="mt-4 py-3 px-6 bg-blue-500 rounded-xl"
    onPress={() => startWorkout()}
  >
    <Text className="text-white font-medium">Start Now</Text>
  </TouchableOpacity>
</View>

{/* Extra padding at bottom for tab navigation */}
<View className="h-16" />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Workout;
