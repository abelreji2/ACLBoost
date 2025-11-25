import React from "react";
import { Stack } from "expo-router";


function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: "History" }} />
      <Stack.Screen name="workout-record" options={{ headerShown: false, title: "Workout Details" }} />
    </Stack>
  );
}

export default Layout;
