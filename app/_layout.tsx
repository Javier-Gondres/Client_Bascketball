import { colors } from "@/UI/colors";
import { NavigationContainer } from "@react-navigation/native";
import { Stack, Tabs } from "expo-router";

export default function RootLayout() {
   return (
      <Stack>
         <Stack.Screen
            name="index"
            options={{
               headerStyle: {
                  backgroundColor: colors.blue.blue400,
               },
            }}
         />
         <Stack.Screen name="home" options={{ headerShown: false }} />
      </Stack>
   );
}
