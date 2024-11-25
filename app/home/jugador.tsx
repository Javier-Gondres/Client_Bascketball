import {
   View,
   SafeAreaView,
   TouchableOpacity,
   FlatList,
   Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "@/UI/colors";
import { TextInput, Text } from "react-native-paper";
import { fontSizes } from "@/UI/fontSizes";
import { spacings } from "@/UI/spacings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { ports } from "@/config/config";
import { Jugador } from "@/interfaces/entities";

const jugador = () => {
   const [jugadores, setJugadores] = useState<Jugador[]>([]);
   const [crudMode, setCrudMode] = useState<"create" | "delete" | "none">(
      "none"
   );

   useEffect(() => {
      const fetchData = async () => {
         try {
            const response = await fetch(`${ports.api}/jugador`, {
               method: "GET",
            });
            const data: Jugador[] = await response.json();
            setJugadores(data);
         } catch (error) {
            console.error(error);
         }
      };

      fetchData();
   }, []);

   return (
      <SafeAreaView
         style={{
            backgroundColor: colors.blueLight,
            flex: 1,
            padding: spacings.s2,
            paddingTop: useSafeAreaInsets().top + 20,
         }}
      >
         <View style={{ flex: 1, gap: spacings.s2 }}>
            <View style={{ gap: spacings.s1 }}>
               <Text
                  style={{
                     fontSize: fontSizes.medium,
                     color: colors.blue.blue900,
                     fontWeight: "bold",
                  }}
               >
                  Dashboard de Jugadores
               </Text>
               <Text
                  style={{
                     fontSize: fontSizes.small,
                     color: colors.blue.blue900,
                     fontWeight: "400",
                  }}
               >
                  Puedes gestionar los jugadores de la base de datos
               </Text>
            </View>
            <View style={{ flexDirection: "row", gap: spacings.s2 }}>
               <TextInput
                  mode="outlined"
                  style={{ flex: 1 }}
                  activeOutlineColor={colors.blue.blue600}
               />
               <TouchableOpacity
                  onPress={() => console.log("aa")}
                  style={{
                     flex: 0.2,
                     backgroundColor: colors.blue.blue600,
                     justifyContent: "center",
                     alignItems: "center",
                     borderRadius: 10,
                  }}
               >
                  <FontAwesome name="search" size={20} color={"white"} />
               </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: spacings.s2 }}>
               <TouchableOpacity
                  onPress={() => setCrudMode("none")}
                  style={{
                     backgroundColor: colors.white,
                     justifyContent: "center",
                     alignItems: "center",
                     borderRadius: 10,
                     padding: 10,
                     width: 100,
                  }}
               >
                  <FontAwesome
                     name="plus"
                     size={20}
                     color={colors.blue.blue600}
                  />
               </TouchableOpacity>
               <TouchableOpacity
                  onPress={() =>
                     crudMode === "delete"
                        ? setCrudMode("none")
                        : setCrudMode("delete")
                  }
                  style={{
                     backgroundColor:
                        crudMode === "delete"
                           ? colors.red.red500
                           : colors.gray.gray300,
                     justifyContent: "center",
                     alignItems: "center",
                     borderRadius: 10,
                     padding: 10,
                     width: 100,
                  }}
               >
                  <FontAwesome
                     name="remove"
                     size={20}
                     color={
                        crudMode === "delete"
                           ? colors.white
                           : colors.gray.gray600
                     }
                  />
               </TouchableOpacity>
            </View>
            <FlatList
               data={jugadores}
               numColumns={2}
               columnWrapperStyle={{ gap: 10 }}
               contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
               renderItem={({ item }) => (
                  <TouchableOpacity
                     style={{
                        backgroundColor: colors.white,
                        maxWidth: 190,
                        minHeight: 250,
                        flex: 1,
                        borderRadius: 10,
                        gap: spacings.s2,
                        padding: 10,
                        shadowColor: "#000",
                        shadowOffset: {
                           width: 0,
                           height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                     }}
                  >
                     <Image
                        source={require("../../assets/images/peter-griffin-basketball.gif")}
                        style={{
                           width: "100%",
                           height: 170,
                           borderRadius: 10,
                        }}
                        resizeMode="cover"
                     />

                     <View style={{ flex: 1, gap: spacings.s1 }}>
                        <Text
                           style={{
                              color: colors.gray.gray800,
                              fontWeight: "400",
                              textAlign: "center",
                           }}
                        >
                           {item.Nombre1} {item.Nombre2} {item.Apellido1}{" "}
                           {item.Apellido2}
                        </Text>
                        <Text
                           style={{
                              color: colors.gray.gray800,
                              fontWeight: "bold",
                              textAlign: "center",
                           }}
                        >
                           Codigo: {item.CodJugador}
                        </Text>
                        <Text
                           style={{
                              color: colors.gray.gray800,
                              fontWeight: "bold",
                              textAlign: "center",
                           }}
                        >
                           Numero: {item.Numero}
                        </Text>
                     </View>
                  </TouchableOpacity>
               )}
            />
         </View>
      </SafeAreaView>
   );
};

export default jugador;
