import { Link } from "expo-router";
import { SafeAreaView, View } from "react-native";
import { Text } from "react-native-paper";

export default function Index() {
   return (
      <SafeAreaView
         style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "red",
         }}
      >
         <Link href={'/home/jugador'} style={{color: 'blue'}}>Edit app/index.tsx to edit this screen.</Link>
      </SafeAreaView>
   );
}
