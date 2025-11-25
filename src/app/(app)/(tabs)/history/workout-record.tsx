import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { client } from "../../../../lib/sanity/client";
import { GetWorkoutRecordQueryResult } from "@/lib/sanity/types";
import { formatDuration } from "lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const getWorkoutRecordQuery = defineQuery(
  `*[_type == "workout" && _id == $workoutId][0]{  _id,  date,  duration,  exercises[] {    exercise-> {      _id,      name  },  sets[]{    reps,    weight,    weightunit,    _type,    _key  },  _type,  _key  }}`
);

export default function WorkoutRecord() {
  const { workoutId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [workout, setWorkout] = useState<GetWorkoutRecordQueryResult | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) return;

      try {
        const result = await client.fetch(getWorkoutRecordQuery, {
          workoutId,
        });
        setWorkout(result);
      } catch (error) {
        console.error("Error fetching workout record:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return "0 mins";
    return formatDuration(seconds);
  };

  const getTotalSets = () => {
    return (
      workout?.exercises?.reduce(
        (total, exercise) => total + (exercise.sets?.length || 0),
        0
      ) || 0
    );
  };

  const getTotalVolume = () => {
    let totalVolume = 0;
    let unit = "lbs";

    workout?.exercises?.forEach((exercise) => {
      exercise.sets?.forEach((set) => {
        if (set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
          unit = set.weightunit || "lbs";
        }
      });
    });
    return { volume: totalVolume, unit };
  };

  const { volume, unit } = getTotalVolume();

  const handleDeleteWorkout = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!workoutId) return;

            // Add this line to show loading state
            setDeleting(true);

            try {
              await fetch("/api/delete-workout", {
                method: "POST",
                body: JSON.stringify({ workoutId }),
              });
              router.replace("/(app)/(tabs)/history?refresh=true");
            } catch (error) {
              console.error("Error deleting workout:", error);
              // If there's an error, you might want to show a toast/alert here
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading workout details...</Text>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 font-medium text-lg">
          Workout not found
        </Text>
        <TouchableOpacity
          className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="bg-white p-4 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-2 flex-1">Workout Details</Text>
        <TouchableOpacity
          onPress={handleDeleteWorkout}
          disabled={deleting}
          className="py-2 px-4 rounded-lg bg-red-50 border border-red-200"
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Text className="text-red-600 font-medium">Delete</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Workout summary card */}
        <View className="bg-white m-4 rounded-xl shadow-sm overflow-hidden">
          <View className="bg-blue-500 p-4">
            <Text className="text-white text-xl font-bold">
              {formatDate(workout?.date)}
            </Text>
            <Text className="text-blue-100 mt-1">
              {formatTime(workout?.date)}
            </Text>
          </View>

          <View className="p-4 space-y-3">
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-2 font-medium">Duration</Text>
              </View>
              <Text className="text-gray-900 font-semibold">
                {formatWorkoutDuration(workout?.duration)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Ionicons name="fitness-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-2 font-medium">
                  Exercises
                </Text>
              </View>
              <Text className="text-gray-900 font-semibold">
                {workout?.exercises?.length || 0}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Ionicons name="layers-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-2 font-medium">
                  Total Sets
                </Text>
              </View>
              <Text className="text-gray-900 font-semibold">
                {getTotalSets()}
              </Text>
            </View>

            {volume > 0 && (
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="barbell-outline" size={20} color="#4B5563" />
                  <Text className="text-gray-700 ml-2 font-medium">Volume</Text>
                </View>
                <Text className="text-gray-900 font-semibold">
                  {volume.toLocaleString()} {unit}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Exercise list */}
        <View className="p-4">
          <Text className="text-lg font-bold mb-4 text-gray-900 px-2">
            Exercise Log
          </Text>

          {workout?.exercises?.map((exercise, index) => (
            <View
              key={exercise._key || index}
              className="mb-4 bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {exercise.exercise?.name || "Unnamed Exercise"}
                  </Text>
                  <Text className="text-gray-500 mt-1">
                    {exercise.sets?.length || 0} sets completed
                  </Text>
                </View>
                <View className="bg-blue-100 rounded-full h-8 w-8 items-center justify-center">
                  <Text className="text-blue-700 font-semibold">
                    {index + 1}
                  </Text>
                </View>
              </View>

              {/* Sets table */}
              <View className="px-4 py-2">
                <View className="flex-row justify-between py-2 border-b border-gray-200">
                  <Text className="font-medium text-gray-500">SET</Text>
                  <Text className="font-medium text-gray-500">WEIGHT</Text>
                  <Text className="font-medium text-gray-500">REPS</Text>
                </View>

                {exercise.sets?.map((set, setIdx) => (
                  <View
                    key={set._key || setIdx}
                    className="flex-row justify-between py-3 border-b border-gray-100"
                  >
                    <Text className="text-gray-700 font-medium">
                      {setIdx + 1}
                    </Text>
                    <Text className="text-gray-900 font-medium">
                      {set.weight || "-"}{" "}
                      {set.weight ? set.weightunit || "lbs" : ""}
                    </Text>
                    <Text className="text-gray-900 font-medium">
                      {set.reps || "-"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Extra padding at the bottom */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
