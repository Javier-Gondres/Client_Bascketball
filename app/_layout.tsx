import { colors } from "@/UI/colors";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <BottomSheetModalProvider>
            <PaperProvider>
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
            </PaperProvider>
         </BottomSheetModalProvider>
      </GestureHandlerRootView>
   );
}
