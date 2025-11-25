import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { defineQuery } from "groq";
import { useUser } from "@clerk/clerk-expo";
import { client } from "../../../../lib/sanity/client";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatDuration } from "../../../../../lib/utils";
import { GetWorkoutsQueryResult } from "@/lib/sanity/types";

// GROQ Query
export const getWorkoutsQuery = defineQuery(
  `*[_type == "workout" && userId == $userId] | order(date desc){
    _id,
    date,
    duration,
    exercises[] {
      exercise-> {
        _id,
        name
      },
      sets[]{
        reps,
        weight,
        weightunit,
        _type,
        _key
      },
      _type,
      _key
    }
  }`
);

export default function History() {
  // State
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refresh } = useLocalSearchParams();

  // Data fetching
  const fetchWorkouts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const results = await client.fetch(getWorkoutsQuery, { userId: user.id });
      setWorkouts(results || []);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  useEffect(() => {
    if (refresh) {
      fetchWorkouts();
      router.replace("/(app)/(tabs)/history");
    }
  }, [refresh]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTotalSets = (workout: GetWorkoutsQueryResult[number]) => {
    return workout.exercises?.reduce(
      (total, exercise) => total + (exercise.sets?.length || 0),
      0
    ) || 0;
  };

  const getExerciseNames = (workout: GetWorkoutsQueryResult[number]) => {
    return (
      workout.exercises?.map((ex) => ex.exercise.name).filter(Boolean) || []
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  // Render functions
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="barbell" size={64} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-900 mt-4">
        No workouts logged yet
      </Text>
      <Text className="text-center text-gray-600 mt-2 px-8">
        Your workout history will appear here once you complete your first workout
      </Text>
      <TouchableOpacity 
        className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
        onPress={() => router.push("/(app)/(tabs)/workout")}
      >
        <Text className="text-white font-medium">Start a Workout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWorkoutCard = (workout: GetWorkoutsQueryResult[number]) => (
    <TouchableOpacity
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4"
      key={workout._id}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "history/workout-record",
          params: { workoutId: workout._id },
        })
      }
    >
      {/* Header with date and icon */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            {formatDate(workout.date)}
          </Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600">
              {formatDuration(workout.duration)}
            </Text>
          </View>
        </View>
        <View className="bg-blue-100 rounded-full w-14 h-14 items-center justify-center">
          <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
        </View>
      </View>

      {/* Workout stats */}
      <View className="flex-row items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
        <View className="items-center flex-1">
          <Text className="text-sm text-gray-500">Exercises</Text>
          <Text className="text-lg font-semibold text-gray-900">
            {workout.exercises?.length || 0}
          </Text>
        </View>
        <View className="h-10 w-px bg-gray-200" />
        <View className="items-center flex-1">
          <Text className="text-sm text-gray-500">Sets</Text>
          <Text className="text-lg font-semibold text-gray-900">
            {getTotalSets(workout)}
          </Text>
        </View>
      </View>

      {/* Exercise tags */}
      {workout.exercises && workout.exercises.length > 0 && (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-3">
            Exercises performed:
          </Text>
          <View className="flex-row flex-wrap">
            {getExerciseNames(workout)
              .slice(0, 3)
              .map((name) => (
                <View
                  key={name}
                  className="bg-blue-50 rounded-lg px-3 py-2 mr-2 mb-2"
                >
                  <Text className="text-sm font-medium text-blue-700">
                    {name}
                  </Text>
                </View>
              ))}
            {getExerciseNames(workout).length > 3 && (
              <View className="bg-blue-50 rounded-lg px-3 py-2 mr-2 mb-2">
                <Text className="text-sm font-medium text-blue-700">
                  +{getExerciseNames(workout).length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Workout History</Text>
        <Text className="text-gray-600 mt-1">
          {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'} completed
        </Text>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading your workouts...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ 
            paddingBottom: 24,
            flexGrow: workouts.length === 0 ? 1 : undefined 
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {workouts.length === 0 ? (
            renderEmptyState()
          ) : (
            <View>
              {workouts.map(renderWorkoutCard)}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}