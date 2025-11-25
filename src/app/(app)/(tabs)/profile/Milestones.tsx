import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "@clerk/clerk-expo";
import { TouchableOpacity, Text, Alert, ScrollView, Image } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ACL recovery milestones data structure
const aclMilestones = [
  {
    phase: "Phase 1: Initial Recovery (0-2 weeks)",
    items: [
      { id: "1-1", text: "Able to perform ankle pumps" },
      { id: "1-2", text: "Reduced post-op swelling" },
      { id: "1-3", text: "Achieved straight leg raises"},
      { id: "1-4", text: "Using crutches confidently" },
      { id: "1-5", text: "Pain adequately controlled"},
    ]
  },
  {
    phase: "Phase 2: Motion & Basic Strength (2-6 weeks)",
    items: [
      { id: "2-1", text: "90° knee flexion achieved" },
      { id: "2-2", text: "Walking without crutches" },
      { id: "2-3", text: "Full knee extension" },
      { id: "2-4", text: "Minimal swelling" },
      { id: "2-5", text: "Normal gait pattern restored" },
    ]
  },
  {
    phase: "Phase 3: Strength Building (6-12 weeks)",
    items: [
      { id: "3-1", text: "Full range of motion" },
      { id: "3-2", text: "Single leg balance 30 seconds" },
      { id: "3-3", text: "Walking on uneven surfaces" },
      { id: "3-4", text: "Light resistance training" },
      { id: "3-5", text: "Cycling without restrictions" },
    ]
  },
  {
    phase: "Phase 4: Advanced Function (3-6 months)",
    items: [
      { id: "4-1", text: "Jogging in straight line" },
      { id: "4-2", text: "Squat at 70-80% body weight" },
      { id: "4-3", text: "Good quadriceps strength" },
      { id: "4-4", text: "Controlled lateral movements" },
      { id: "4-5", text: "Hopping without pain" },
    ]
  },
  {
    phase: "Phase 5: Return to Activity (6-12 months)",
    items: [
      { id: "5-1", text: "Running with direction changes" },
      { id: "5-2", text: "Sport-specific movements" },
      { id: "5-3", text: "Jumping confidently" },
      { id: "5-4", text: "Passed return-to-sport test" },
      { id: "5-5", text: "Returned to sport/activity" },
    ]
  }
];

export default function ProfilePage() {
  const { signOut} = useAuth();
  const [completedMilestones, setCompletedMilestones] = useState({});

  // Load completed milestones from storage
  React.useEffect(() => {
    loadCompletedMilestones();
  }, []);

  const loadCompletedMilestones = async () => {
    try {
      const savedMilestones = await AsyncStorage.getItem('aclCompletedMilestones');
      if (savedMilestones !== null) {
        setCompletedMilestones(JSON.parse(savedMilestones));
      }
    } catch (error) {
      console.error('Failed to load milestones:', error);
    }
  };

  const saveMilestones = async (newMilestones) => {
    try {
      await AsyncStorage.setItem('aclCompletedMilestones', JSON.stringify(newMilestones));
    } catch (error) {
      console.error('Failed to save milestones:', error);
    }
  };

  const toggleMilestone = (id) => {
    const newMilestones = {
      ...completedMilestones,
      [id]: !completedMilestones[id]
    };
    setCompletedMilestones(newMilestones);
    saveMilestones(newMilestones);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalMilestones = aclMilestones.reduce((sum, phase) => sum + phase.items.length, 0);
    const completedCount = Object.values(completedMilestones).filter(value => value).length;
    return Math.round((completedCount / totalMilestones) * 100);
  };

  const handleSignout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: () => signOut(),
      },
    ]);
  };
  
  return (
    <View className="flex-1 bg-white">

      {/* Progress Bar */}
      <View className="px-5 py-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-blue-800 font-medium">Recovery Progress</Text>
          <Text className="text-yellow-600 font-bold">{calculateProgress()}%</Text>
        </View>
        <View className="h-3 bg-gray-200 rounded-full mt-2">
          <View 
            className="h-3 bg-blue-600 rounded-full"
            style={{ width: `${calculateProgress()}%` }}
          >
            <View className="h-3 w-3 rounded-full bg-yellow-500 absolute right-0" />
          </View>
        </View>
      </View>

      {/* Milestones Checklist */}
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {aclMilestones.map((phase) => (
            <View key={phase.phase} className="mb-6">
              <View className="bg-blue-800 px-4 py-2 rounded-t-lg">
                <Text className="text-white font-medium">{phase.phase}</Text>
              </View>
              <View className="bg-blue-50 rounded-b-lg overflow-hidden">
                {phase.items.map((milestone) => (
                  <TouchableOpacity
                    key={milestone.id}
                    onPress={() => toggleMilestone(milestone.id)}
                    className={`flex-row items-center px-4 py-3 border-b border-blue-100 ${
                      completedMilestones[milestone.id] ? "bg-blue-50" : "bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className={`h-6 w-6 rounded-full mr-3 items-center justify-center ${
                      completedMilestones[milestone.id]
                        ? "bg-yellow-500"
                        : "border border-blue-300"
                    }`}>
                      {completedMilestones[milestone.id] && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-blue-800 ${
                        completedMilestones[milestone.id] ? "line-through opacity-70" : ""
                      }`}>
                        {milestone.text}
                      </Text>

                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sign Out Button */}
      <View className="px-5 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity 
          onPress={handleSignout} 
          className="bg-red-800 p-4 rounded-xl shadow-sm"
          activeOpacity={0.7}>
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="white"/>
            <Text className="text-white font-medium ml-2">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}