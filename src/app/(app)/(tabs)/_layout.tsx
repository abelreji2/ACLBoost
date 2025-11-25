import { Tabs } from "expo-router"
import AntDesign from "@expo/vector-icons/AntDesign"

function Layout() {
  return (
    <Tabs>
        <Tabs.Screen 
        name="index"
        options = {{
            headerShown:false, 
            title:"Main",
            tabBarIcon:({color, size}) => (
            <AntDesign name="home" color={color} size={size} />
        )
        }}       
        />

        <Tabs.Screen 
        name="exercises"
        options = {{
            headerShown:false, 
            title:"Exercises",
            tabBarIcon:({color, size}) => (
            <AntDesign name="book" color={color} size={size} />
        )
        }}       
        />

        <Tabs.Screen 
        name="workout"
        options = {{
            headerShown:false, 
            title:"Workout",
            tabBarIcon:({color, size}) => (
            <AntDesign name="plus-circle" color={color} size={size} />
        )
        }}       
        />

        <Tabs.Screen 
        name="history"
        options = {{
            headerShown:false, 
            title:"History",
            tabBarIcon:({color, size}) => (
            <AntDesign name="clock-circle" color={color} size={size} />
        )
        }}       
        />
        <Tabs.Screen 
        name="profile"
        options = {{
            headerShown:false, 
            title:"Progress",
            tabBarIcon:({color, size}) => (
            <AntDesign name="user" color={color} size={size} />
        )
        }}       
        />
        <Tabs.Screen 
        name="active-workout"
        options = {{
            headerShown:false, 
            title:"Active Workout",
            href:null,
            tabBarStyle:{
                display:"none"
            }
        }}       
        />
    </Tabs>
  )
}

export default Layout