import {
   View,
   SafeAreaView,
   TouchableOpacity,
   FlatList,
   Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { colors } from "@/UI/colors";
import { TextInput, Text } from "react-native-paper";
import { fontSizes } from "@/UI/fontSizes";
import { spacings } from "@/UI/spacings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { ports } from "@/config/config";
import { Jugador } from "@/interfaces/entities";
import CBottomSheetModal from "@/components/CBottomsheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import JugadorFormulario from "@/components/jugadorFormulario/jugadorFormulario";

const jugador = () => {
   const [jugadores, setJugadores] = useState<Jugador[]>([]);
   const [selected, setSelected] = useState<Jugador | null>(null);
   const [crudMode, setCrudMode] = useState<"create" | "delete" | "none">(
      "none"
   );
   const [refreshing, setRefreshing] = useState(false);
   const bottomSheetCreate = useRef<BottomSheetModal>(null);

   useEffect(() => {
      fetchData();
   }, []);

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

   const presentBottomSheet = (ref: React.RefObject<BottomSheetModal>) => {
      ref.current?.present();
   };

   const closeBottomSheet = (ref: React.RefObject<BottomSheetModal>) => {
      ref.current?.close();
   };

   const createJugador = async (
      jugador: Omit<
         Jugador,
         "ciudad" | "equipo" | "estadisticasDeJuego" | "CodJugador"
      >
   ) => {
      try {
         const response = await fetch(`${ports.api}/jugador`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(jugador),
         });

         if (!response.ok) {
            throw new Error(
               `Error al crear el jugador: ${response.statusText}`
            );
         }

         const data: Jugador = await response.json();
         setJugadores((prev) => [data, ...prev]);
         console.log("Jugador creado: ", data.CodJugador);
      } catch (error) {
         console.error("Error al crear el jugador:", error);
      }
   };

   const updateJugador = async (
      codigo: string,
      jugador: Omit<
         Jugador,
         "ciudad" | "equipo" | "estadisticasDeJuego" | "CodJugador"
      >
   ) => {
      try {
         const response = await fetch(`${ports.api}/jugador/${codigo}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(jugador),
         });

         if (response.status != 200) {
            throw new Error(
               `Error al actualizar el jugador: ${response.statusText}`
            );
         }

         const data: Jugador = await response.json();
         setJugadores((prev) => {
            const oldArr = [...prev];
            const index = oldArr.findIndex(
               (j) => j.CodJugador === data.CodJugador
            );

            if (index !== -1) {
               oldArr[index] = data;
            } else {
               oldArr.push(data);
            }

            return oldArr;
         });
         console.log("Jugador actalizado: ", data.CodJugador);
      } catch (error) {
         console.error("Error al crear el jugador:", error);
      }
   };

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
                  onPress={() => {
                     setCrudMode("none");
                     presentBottomSheet(bottomSheetCreate);
                  }}
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
               refreshing={refreshing}
               onRefresh={() => {
                  setRefreshing(true);
                  fetchData().finally(() => setRefreshing(false));
               }}
               data={jugadores}
               numColumns={2}
               columnWrapperStyle={{ gap: 10 }}
               contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
               renderItem={({ item }) => (
                  <TouchableOpacity
                     onPress={() => {
                        setSelected(item);
                        presentBottomSheet(bottomSheetCreate);
                     }}
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
         <CBottomSheetModal
            cRef={bottomSheetCreate}
            index={1}
            snapPoints={["60%", "90%"]}
            onDismiss={() => setSelected(null)}
            backgroundStyle={{ backgroundColor: colors.blue.blue200 }}
         >
            <JugadorFormulario
               initialJugador={selected}
               onAccept={async (form) => {
                  const data = {
                     Apellido1: form.primerApellido,
                     Apellido2: form.segundoApellido,
                     CiudadNacim: form.ciudadDeNacimiento?.CodCiudad ?? null,
                     CodEquipo: form.equipo?.CodEquipo ?? null,
                     FechaNacim: form.fechaNacimiento,
                     Nombre1: form.primerNombre,
                     Nombre2: form.segundoNombre,
                     Numero: form.numero,
                  };
                  if (selected) {
                     await updateJugador(selected.CodJugador, data);
                  } else await createJugador(data);
                  closeBottomSheet(bottomSheetCreate);
               }}
               onCancel={() => {
                  closeBottomSheet(bottomSheetCreate);
               }}
            />
         </CBottomSheetModal>
      </SafeAreaView>
   );
};

export default jugador;
