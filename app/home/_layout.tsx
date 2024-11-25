import { Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { colors } from "@/UI/colors";

export default function RootLayout() {
   return (
      <Tabs screenOptions={{ animation: "shift" }}>
         <Tabs.Screen
            name="jugador"
            options={{
               tabBarIcon: ({ focused }) => (
                  <FontAwesome6
                     name="person"
                     color={focused ? colors.blue.blue600 : colors.blue.blue400}
                     size={20}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="ciudad"
            options={{
               tabBarIcon: ({ focused }) => (
                  <FontAwesome6
                     name="city"
                     size={20}
                     color={focused ? colors.blue.blue600 : colors.blue.blue400}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="estadistica"
            options={{
               tabBarIcon: ({ focused }) => (
                  <Ionicons
                     name="newspaper"
                     size={20}
                     color={focused ? colors.blue.blue600 : colors.blue.blue400}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="estadisticaJuego"
            options={{
               tabBarLabel(props) {
                  return (
                     <Text
                        style={{
                           color: props.focused
                              ? colors.blue.blue600
                              : colors.blue.blue400,
                           fontSize: 10,
                        }}
                     >
                        Est. J
                     </Text>
                  );
               },
               headerTitle: "opa",
               tabBarIcon: ({ focused }) => (
                  <FontAwesome5
                     name="readme"
                     color={focused ? colors.blue.blue600 : colors.blue.blue400}
                     size={20}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="juego"
            options={{
               tabBarIcon: ({ focused }) => (
                  <FontAwesome5
                     name="basketball-ball"
                     color={focused ? colors.blue.blue600 : colors.blue.blue400}
                     size={20}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="equipo"
            options={{
               tabBarIcon: ({ focused }) => (
                  <FontAwesome6
                     name="people-group"
                     size={20}
                     color={focused ? colors.blue.blue600 : colors.blue.blue400}
                  />
               ),
            }}
         />
      </Tabs>
   );
}
