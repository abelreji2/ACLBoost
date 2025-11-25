import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { useWorkoutStore, WorkoutSet } from "../../../../store/workout-store";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ExerciseSelectionModal from "../../components/ExerciseSelectionModal";
import { defineQuery } from "groq";
import { client, adminClient} from "../../../lib/sanity/client";
import { useUser } from "node_modules/@clerk/clerk-expo/dist/hooks";
import { WorkoutData } from "../../api/save-workout+api";

const findExerciseQuery =
  defineQuery(`*[_type == "exercises" && name == $name][0]{
  _id,
  name,
}`);

export default function ActiveWorkout() {
  const { user } = useUser();
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    workoutExercise,
    setWorkoutExercise,
    resetWorkout,
    weightUnitPreference,
  } = useWorkoutStore();

  const { seconds, minutes, hours, totalSeconds, reset } = useStopwatch({
    autoStart: true,
  });

  useFocusEffect(
    React.useCallback(() => {
      if (workoutExercise.length === 0) {
        reset();
      }
    }, [workoutExercise.length, reset])
  );

  const getWorkoutDuration = () => {
    return `${hours > 0 ? `${hours}:` : ""}${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const saveWorkout = () => {
    Alert.alert(
      "Complete Workout",
      "Are you sure you want to complete the workout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Complete", onPress: async () => await endWorkout() },
      ]
    );
  };

  const endWorkout = async () => {
    const saved = await saveWorkoutToDatabase();
    if (saved) {
      Alert.alert("Workout Saved", "Your workout has been saved successfully.");
      resetWorkout();
      router.back();
    }
  };

  const saveWorkoutToDatabase = async () => {
    if (isSaving) return false;
    setIsSaving(true);
    try {
      console.log("Starting workout save process");
      const durationInSeconds = totalSeconds;

      const exercisesForSanity = await Promise.all(
        workoutExercise.map(async (exercise) => {
          const exerciseDoc = await client.fetch(findExerciseQuery, {
            name: exercise.name,
          });
          if (!exerciseDoc) {
            throw new Error(
              `Exercise "${exercise.name}" not found in database.`
            );
          }

          const setsForSanity = exercise.sets
            .filter((set) => set.isCompleted && set.reps && set.weight)
            .map((set) => ({
              _type: "set",
              _key: Math.random().toString(36).substr(2, 9),
              reps: parseInt(set.reps, 10) || 0,
              weight: parseFloat(set.weight) || 0,
            }));

          return {
            _type: "workoutExercise",
            _key: Math.random().toString(36).substr(2, 9),
            exercise: {
              _type: "reference",
              _ref: exerciseDoc._id,
            },
            sets: setsForSanity,
          };
        })
      );

      const validExercises = exercisesForSanity.filter(
        (ex) => ex.sets.length > 0
      );

      if (validExercises.length === 0) {
        Alert.alert(
          "No Completed Sets",
          "Finish at least one set before saving."
        );
        return false;
      }

      const workoutData = {
        _type: "workout",
        userId: user?.id || "anonymous",
        date: new Date().toISOString(),
        duration: durationInSeconds,
        exercises: validExercises,
      };

      console.log(" Saving workout directly to Sanity");
      console.log(" User ID:", user?.id);
      console.log(" Exercises count:", validExercises.length);
      console.log(" Duration:", durationInSeconds);

      // Save directly to Sanity (bypasses all network issues)
      const result = await adminClient.create(workoutData);

      console.log(" Workout saved");
      console.log(" Document ID:", result._id);

      return true;
    } catch (error) {
      console.error(" Error saving workout:", error);

      // Enhanced error handling for Sanity-specific issues
      if (
        error.message?.includes("Exercise") &&
        error.message?.includes("not found")
      ) {
        Alert.alert(
          "Exercise Not Found",
          "One of your exercises wasn't found in the database. Please refresh the exercise list and try again."
        );
      } else if (error.message?.includes("apiVersion")) {
        Alert.alert(
          "API Version Error",
          "Please update your Sanity client. Run: npm install @sanity/client@latest"
        );
      } else if (
        error.message?.includes("token") ||
        error.message?.includes("auth")
      ) {
        Alert.alert(
          "Authentication Error",
          "Missing Sanity authentication token. Check your environment variables."
        );
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        Alert.alert(
          "Connection Error",
          "Cannot connect to Sanity. Check your internet connection."
        );
      } else {
        Alert.alert(
          "Save Failed",
          `Error: ${error.message}\n\nPlease try again or contact support.`
        );
      }

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const cancelWorkout = () => {
    Alert.alert("End Workout", "Are you sure you want to end this workout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Workout",
        style: "destructive",
        onPress: () => {
          resetWorkout();
          router.back();
        },
      },
    ]);
  };

  const addExercise = () => {
    setShowExerciseSelection(true);
  };

  const deleteExercise = (id: string) => {
    setWorkoutExercise((prev) => prev.filter((ex) => ex.id !== id));
  };

  const addNewSet = (exerciseId: string) => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(),
      reps: "",
      weight: "",
      weightUnit: weightUnitPreference,
      isCompleted: false,
    };
    setWorkoutExercise((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setWorkoutExercise((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? { ...set, isCompleted: !set.isCompleted }
                  : set
              ),
            }
          : exercise
      )
    );
  };

  const deleteSet = ({
    exerciseId,
    setId,
  }: {
    exerciseId: string;
    setId: string;
  }) => {
    setWorkoutExercise((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      )
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string
  ) => {
    setWorkoutExercise((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : exercise
      )
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-blue-800 text-2xl font-bold">
              Active Workout
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="time-outline" size={16} color="#EAB308" />
              <Text className="text-blue-700 ml-1 font-medium">
                {getWorkoutDuration()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-50 h-10 w-10 rounded-full items-center justify-center"
            onPress={cancelWorkout}
          >
            <Ionicons name="close" size={20} color="#BE123C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Exercise Count */}
      <View className="px-6 py-3 bg-gray-50">
        <Text className="text-center text-blue-700">
          {workoutExercise.length}{" "}
          {workoutExercise.length === 1 ? "exercise" : "exercises"}
        </Text>
      </View>

      {/* Workout Content */}
      <View className="flex-1 bg-gray-50">
        {workoutExercise.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="barbell-outline" size={64} color="#EAB308" />
            <Text className="text-blue-800 text-lg font-semibold mt-4">
              No exercises added yet
            </Text>
            <Text className="text-blue-700 text-center mx-10 mt-2">
              Start by adding exercises to your workout
            </Text>

            <TouchableOpacity
              className="mt-6 bg-blue-800 px-6 py-3 rounded-lg flex-row items-center shadow-sm"
              onPress={addExercise}
            >
              <Ionicons name="add" size={18} color="#EAB308" />
              <Text className="text-white font-medium ml-2">Add Exercise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView className="flex-1 px-6 mt-4">
              {workoutExercise.map((exercise) => (
                <View
                  key={exercise.id}
                  className="mb-6 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                >
                  {/* Exercise Header */}
                  <View className="flex-row items-center justify-between p-4 border-b border-gray-00 bg-blue-800">
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">
                        {exercise.name}
                      </Text>
                      <Text className="text-yellow-400 text-sm mt-1">
                        {exercise.sets.length}{" "}
                        {exercise.sets.length === 1 ? "set" : "sets"}
                      </Text>
                    </View>

                    <View className="flex-row">
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/exercise-details",
                            params: { id: exercise.sanityId },
                          })
                        }
                        className="mr-2 h-9 w-9 rounded-full bg-blue-700 items-center justify-center"
                      >
                        <Ionicons
                          name="information-circle-outline"
                          size={20}
                          color="#EAB308"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => deleteExercise(exercise.id)}
                        className="h-9 w-9 rounded-full bg-blue-700 items-center justify-center"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#FCA5A5"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Body */}
                  <View className="p-4">
                    {/* Set header */}
                    {exercise.sets.length > 0 ? (
                      exercise.sets.map((set, setIndex) => (
                        <View
                          key={setIndex}
                          className={`mb-3 rounded-lg border ${
                            set.isCompleted
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-gray-200"
                          }`}
                        >
                          <View className="flex-row items-center p-3">
                            {/* Set Number */}
                            <View className="w-8 h-8 rounded-full bg-blue-800 items-center justify-center mr-2">
                              <Text className="text-yellow-400 font-medium">
                                {setIndex + 1}
                              </Text>
                            </View>

                            {/* Reps Input */}
                            <View className="flex-1 px-1">
                              <Text className="text-xs text-blue-600 mb-1">
                                Reps
                              </Text>
                              <TextInput
                                value={set.reps}
                                onChangeText={(value) =>
                                  updateSet(exercise.id, set.id, "reps", value)
                                }
                                keyboardType="numeric"
                                className={`px-2 py-2 border rounded-lg text-center ${
                                  set.isCompleted
                                    ? "bg-yellow-50 border-yellow-300 text-blue-800"
                                    : "bg-white border-gray-300 text-blue-800"
                                }`}
                                editable={!set.isCompleted}
                                placeholderTextColor="#94A3B8"
                                placeholder="0"
                              />
                            </View>

                            {/* Weight Input */}
                            <View className="flex-1 px-1">
                              <Text className="text-xs text-blue-600 mb-1">
                                Weight (lbs)
                              </Text>
                              <TextInput
                                value={set.weight}
                                onChangeText={(value) =>
                                  updateSet(
                                    exercise.id,
                                    set.id,
                                    "weight",
                                    value
                                  )
                                }
                                keyboardType="numeric"
                                className={`px-2 py-2 border rounded-lg text-center ${
                                  set.isCompleted
                                    ? "bg-yellow-50 border-yellow-300 text-blue-800"
                                    : "bg-white border-gray-300 text-blue-800"
                                }`}
                                editable={!set.isCompleted}
                                placeholderTextColor="#94A3B8"
                                placeholder="0"
                              />
                            </View>

                            {/* Complete Button */}
                            <TouchableOpacity
                              onPress={() =>
                                toggleSetCompletion(exercise.id, set.id)
                              }
                              className={`h-10 w-10 rounded-full items-center justify-center ml-2 ${
                                set.isCompleted
                                  ? "bg-yellow-100 border border-yellow-500"
                                  : "bg-gray-100 border border-gray-300"
                              }`}
                            >
                              <Ionicons
                                name={
                                  set.isCompleted
                                    ? "checkmark"
                                    : "checkmark-outline"
                                }
                                size={18}
                                color={set.isCompleted ? "#B45309" : "#9CA3AF"}
                              />
                            </TouchableOpacity>

                            {/* Delete Set Button */}
                            <TouchableOpacity
                              onPress={() =>
                                deleteSet({
                                  exerciseId: exercise.id,
                                  setId: set.id,
                                })
                              }
                              className="h-10 w-10 rounded-full items-center justify-center ml-1"
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#BE123C"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View className="py-6 items-center">
                        <Text className="text-blue-600 mb-1">
                          No sets added yet
                        </Text>
                        <Text className="text-blue-500 text-xs">
                          Add your first set below
                        </Text>
                      </View>
                    )}

                    {/* Add set button */}
                    <TouchableOpacity
                      onPress={() => addNewSet(exercise.id)}
                      className="flex-row items-center justify-center mt-4 py-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <Ionicons name="add-circle" size={18} color="#EAB308" />
                      <Text className="text-blue-800 font-medium ml-2">
                        Add Set
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                className="my-6 bg-blue-800 px-6 py-3 rounded-lg flex-row items-center justify-center shadow-sm"
                onPress={addExercise}
              >
                <Ionicons name="add" size={18} color="#EAB308" />
                <Text className="text-white font-medium ml-2">
                  Add Exercise
                </Text>
              </TouchableOpacity>

              <View className="h-24" />

              <TouchableOpacity
                onPress={saveWorkout}
                className={`rounded-2xl py-4 items-center mb-8 ${
                  isSaving ||
                  workoutExercise.length === 0 ||
                  workoutExercise.some((exercise) =>
                    exercise.sets.some((set) => !set.isCompleted)
                  )
                    ? "bg-gray-500"
                    : "bg-green-500"
                }`}
                disabled={
                  isSaving ||
                  workoutExercise.length === 0 ||
                  workoutExercise.some((exercise) =>
                    exercise.sets.some((set) => !set.isCompleted)
                  )
                }
              >
                {isSaving ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-medium ml-2">
                      Saving...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-medium">Save Workout</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </>
        )}
      </View>

      <ExerciseSelectionModal
        visible={showExerciseSelection}
        onClose={() => setShowExerciseSelection(false)}
      />
    </SafeAreaView>
  );
}
