import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { defineQuery } from "groq";
// Update the import path to the correct location of your Sanity client
import { client } from "../../../lib/sanity/client";
import { Exercises } from "sanity/sanity.types";
// Make sure the import path is correct for your project structure
import ExerciseCard from "../../components/ExerciseCard";

export const exercisesQuery = defineQuery(`*[_type == "exercises"]{
  ...
}`);

function ExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercises] = useState<Exercises[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercises[]>([]);
  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exercisesQuery);
      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    const filtered = exercises.filter((exercise: Exercises) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [searchQuery, exercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };
  return (
    <SafeAreaView className="flex flex-1 bg-white">
      <View className="bg-white px-6 pt-4 pb-2 border-b border-gray-100">
        <View className="flex-row items-center justify-center">
          <View className="bg-blue-100 p-2 rounded-full mr-2">
            <Ionicons name="fitness-outline" size={24} color="#1e40af" />
          </View>
          <Text className="text-2xl font-bold text-blue-800">
            Exercise Library
          </Text>
        </View>
        <View className="flex-row items-center justify-center mt-2">
          <View className="h-0.5 w-12 bg-yellow-500 mr-2" />
          <Text className="text-yellow-600 text-sm font-medium">
            Find the perfect exercises
          </Text>
          <View className="h-0.5 w-12 bg-yellow-500 ml-2" />
        </View>

        {/* Search Bar */}
        <View className="mt-4 mb-1 bg-blue-50 rounded-xl border border-blue-100 flex-row items-center px-4 py-2.5">
          <Ionicons name="search" size={20} color="#3b82f6" />
          <TextInput
            className="flex-1 ml-2 text-blue-800"
            placeholder="Search exercises..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="bg-blue-100 rounded-full p-1"
            >
              <Ionicons name="close" size={18} color="#1e40af" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => {
              router.push(`/exercise-details?id=${item._id}`);
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#39a3e0ff"]}
            tintColor={"#30548aff"}
            title={"Pull to refresh exercises"}
            titleColor={"#666668ff"}
          />
        }
        ListEmptyComponent={
          <View className="bg-white rounded-xl p-6 m-4 items-center justify-center">
            <Ionicons name="library" size={64} color="gray" className="mb-4" />
            <Text className="text-xl font-semibold text-gray-800 mt-4">
              {searchQuery ? "No exercises found" : "Loading..."}
            </Text>
            <Text className="text-gray-600 mt-2 text-center">
              {searchQuery
                ? `Try a different search term.`
                : `Please wait while we load the exercises.`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default ExercisesScreen;
