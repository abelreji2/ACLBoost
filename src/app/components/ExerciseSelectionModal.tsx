import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useWorkoutStore } from "../../../store/workout-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ExerciseCard from "./ExerciseCard";
import { exercisesQuery } from "../(app)/(tabs)/exercises";
import { Exercises } from "@/lib/sanity/types";
import { client } from "@/lib/sanity/client";

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ExerciseSelectionModal({
  visible,
  onClose,
}: ExerciseSelectionModalProps) {
  // Hooks
  const router = useRouter();
  const { addExercise } = useWorkoutStore();

  // State
  const [exercises, setExercises] = useState<Exercises[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredExercises, setFilteredExercises] = useState<Exercises[]>([]);

  // Fetch exercises when modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchExercises();
    }
  }, [visible]);

  // Filter exercises when search query changes
  useEffect(() => {
    const filtered = exercises.filter((exercise) => exercise.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredExercises(filtered);
  }, [searchQuery, exercises]);

  // Data fetching
  const fetchExercises = async () => {
    try {
      setLoading(true);
      const results = await client.fetch(exercisesQuery);
      setExercises(results || []);
      setFilteredExercises(results || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExercisePress = (exercise: Exercises) => {
    addExercise({ name: exercise.name, sanityId: exercise._id });
    onClose();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
  };

  // Render helpers
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons
        name={searchQuery ? "search-outline" : "fitness-outline"}
        size={64}
        color="#9ca3af"
      />
      <Text className="text-gray-500 mt-4 text-center px-6">
        {searchQuery
          ? "No exercises match your search"
          : loading
          ? "Loading exercises..."
          : "No exercises found. Pull down to refresh"}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
          <Text className="text-gray-800 text-xl font-bold">Add Exercise</Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-200"
          >
            <Ionicons name="close" size={22} color="#4b5563" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 pt-3 pb-2 bg-gray-100">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2.5 border border-gray-200">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-800 text-base"
              placeholder="Search exercises..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="rounded-full p-1"
              >
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Instructions */}
        <Text className="text-gray-600 text-center py-2 px-4 text-sm">
          Tap any exercise to add it to your workout
        </Text>

        {/* Exercise List */}
        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center bg-gray-100">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4">Loading exercises...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View className="bg-white mb-2 rounded-lg shadow-sm border border-gray-200">
                <TouchableOpacity
                  className="flex-row items-center p-4"
                  onPress={() => handleExercisePress(item)}
                >
                  <View className="bg-blue-100 h-10 w-10 rounded-md items-center justify-center mr-3">
                    <Ionicons
                      name="barbell-outline"
                      size={18}
                      color="#3B82F6"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">
                      {item.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {item.muscleGroup}
                    </Text>
                  </View>
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 100,
              paddingHorizontal: 16,
              flexGrow: filteredExercises.length === 0 ? 1 : undefined,
              backgroundColor: "#f3f4f6",
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3b82f6"]}
                tintColor="#4b5563"
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
