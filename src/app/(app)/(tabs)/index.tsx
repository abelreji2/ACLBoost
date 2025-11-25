import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [exercise, setExercise] = useState("");
  const [exercisesByDate, setExercisesByDate] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef(null);

  // Load and save functions remain unchanged
  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveExercises();
    }
  }, [exercisesByDate, isLoading]);

  const loadExercises = async () => {
    try {
      const savedExercises = await AsyncStorage.getItem("exercises");
      if (savedExercises !== null) {
        setExercisesByDate(JSON.parse(savedExercises));
      }
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExercises = async () => {
    try {
      await AsyncStorage.setItem("exercises", JSON.stringify(exercisesByDate));
    } catch (error) {
      console.error("Failed to save exercises:", error);
    }
  };

  // Business logic remains the same
  const addExercise = () => {
    if (!exercise.trim()) return;

    const timestamp = new Date().toISOString();
    const newExercise = {
      id: Date.now().toString(),
      text: exercise,
      done: false,
      createdAt: timestamp,
    };

    setExercisesByDate((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newExercise],
    }));
    setExercise("");
  };

  const toggleDone = (id) => {
    setExercisesByDate((prev) => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const removeExercise = (id) => {
    setExercisesByDate((prev) => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter((item) => item.id !== id),
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "today";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Update calendar markers to match theme
  const getMarkedDates = () => {
    const markedDates = {};

    Object.keys(exercisesByDate).forEach((date) => {
      if (exercisesByDate[date].length > 0) {
        markedDates[date] = {
          marked: true,
          dotColor: "#EAB308", // Gold dot
        };
      }
    });

    // Highlight the selected date
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: "#1e40af", // Darker blue
    };

    return markedDates;
  };

  const exercises = exercisesByDate[selectedDate] || [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header - Updated to Blue/Gold */}
      <View
        className="px-5 py-6 bg-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-center">
          <View className="bg-blue-100 p-2 rounded-full mr-2">
            <Ionicons name="barbell-outline" size={24} color="#1e40af" />
          </View>
          <Text className="text-2xl font-bold text-blue-800">ACL BOOST</Text>
        </View>
        <View className="flex-row items-center justify-center mt-3">
          <View className="h-0.5 w-12 bg-yellow-500 mr-2" />
          <Text className="text-yellow-600 text-sm font-medium">
            Track your ACL recovery
          </Text>
          <View className="h-0.5 w-12 bg-yellow-500 ml-2" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="pt-6" />

          {/* Calendar Section - Updated theme */}
          <View className="px-4 pb-4">
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
              markedDates={getMarkedDates()}
              theme={{
                todayTextColor: "#1e40af", // Dark blue
                arrowColor: "#1e40af", // Dark blue
                selectedDayBackgroundColor: "#1e40af",
                selectedDayTextColor: "#ffffff",
                textDayFontFamily: "System",
                textMonthFontFamily: "System",
                textDayHeaderFontFamily: "System",
                textDayFontWeight: "400",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "600",
                dotColor: "#EAB308", // Gold
                monthTextColor: "#1e40af",
              }}
            />
          </View>

          {/* Date Title - Updated to Gold accent */}
          <View className="px-5 py-3 flex-row items-center">
            <View className="w-2 h-6 bg-yellow-500 rounded-full mr-2" />
            <Text className="text-lg font-bold text-blue-800">
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                "en-US",
                {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }
              )}
            </Text>
          </View>

          {/* Add Exercise Input - Updated colors */}
          <View className="px-5 flex-row items-center mb-4">
            <TextInput
              ref={inputRef}
              className="flex-1 bg-white rounded-lg px-4 py-3 text-blue-800 border border-blue-100"
              placeholder="Add new exercise..."
              value={exercise}
              onChangeText={setExercise}
              onSubmitEditing={addExercise}
              returnKeyType="done"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              className="ml-2 bg-blue-800 h-12 w-12 rounded-full items-center justify-center"
              onPress={addExercise}
            >
              <Ionicons name="add" size={24} color="#fdfdfdff" />
            </TouchableOpacity>
          </View>

          {/* Exercise List - Updated theme */}
          <View className="px-5">
            {exercises.length === 0 ? (
              <View className="items-center justify-center py-10 bg-blue-50 rounded-xl border border-blue-100">
                <Ionicons name="calendar-outline" size={48} color="#93c5fd" />
                <Text className="text-blue-600 mt-4 font-medium">
                  No exercises for this date
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-blue-100 px-4 py-2 rounded-full"
                  onPress={() => inputRef.current?.focus()}
                >
                  <Text className="text-blue-800 font-medium">
                    Add your first exercise
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text className="text-yellow-600 mb-2 text-xs uppercase font-semibold">
                  Your Exercises
                </Text>
                {exercises.map((item) => (
                  <View
                    key={item.id}
                    className="mb-3 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center justify-between p-4">
                      <TouchableOpacity
                        className="flex-row items-center flex-1"
                        onPress={() => toggleDone(item.id)}
                        activeOpacity={0.7}
                      >
                        {/* Checkbox with gold accent */}
                        <View
                          className={`h-6 w-6 rounded-full mr-3 items-center justify-center ${
                            item.done
                              ? "bg-yellow-500 border-2 border-yellow-500"
                              : "border-2 border-blue-300"
                          }`}
                        >
                          {item.done && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="white"
                            />
                          )}
                        </View>

                        <View className="flex-1">
                          <Text
                            className={`text-base font-medium ${
                              item.done
                                ? "text-blue-400 line-through"
                                : "text-blue-800"
                            }`}
                          >
                            {item.text}
                          </Text>
                          <Text className="text-xs text-blue-500 mt-1">
                            Added on {formatDate(item.createdAt)}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Delete button */}
                      <TouchableOpacity
                        className="h-9 w-9 rounded-full bg-blue-50 items-center justify-center ml-2"
                        onPress={() => removeExercise(item.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#BE123C"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Completion indicator with gold */}
                    {item.done && (
                      <View className="bg-yellow-100 py-1 px-3">
                        <Text className="text-xs text-yellow-700 font-medium">
                          Completed
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>

          <View className="h-12" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
