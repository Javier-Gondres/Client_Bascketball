import React, { useState, useEffect, useRef, useCallback } from "react";
import {
   View,
   SafeAreaView,
   TouchableOpacity,
   FlatList,
   Image,
   Modal,
   StyleSheet,
} from "react-native";
import { Text, Searchbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { colors } from "@/UI/colors";
import { fontSizes } from "@/UI/fontSizes";
import { spacings } from "@/UI/spacings";
import { ports } from "@/config/config";
import { Jugador } from "@/interfaces/entities";
import CBottomSheetModal from "@/components/CBottomsheet";
import JugadorFormulario from "@/components/jugadorFormulario/jugadorFormulario";
import PopUp from "@/components/popup/PopUp";

const Jugadores = () => {
   const [jugadores, setJugadores] = useState<Jugador[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [selected, setSelected] = useState<Jugador | null>(null);
   const [selectedToRemove, setSelectedToRemove] = useState<
      Map<string, Jugador>
   >(new Map());
   const [crudMode, setCrudMode] = useState<"create" | "delete" | "none">(
      "none"
   );
   const [refreshing, setRefreshing] = useState(false);
   const [showRemoveModal, setShowRemoveModal] = useState(false);

   const bottomSheetCreate = useRef<BottomSheetModal>(null);
   const insets = useSafeAreaInsets();

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = useCallback(async () => {
      try {
         const response = await fetch(`${ports.api}/jugador`);
         const data: Jugador[] = await response.json();
         setJugadores(data);
      } catch (error) {
         console.error(error);
      }
   }, []);

   const presentBottomSheet = () => bottomSheetCreate.current?.present();
   const closeBottomSheet = () => bottomSheetCreate.current?.close();

   const createJugador = async (jugadorData: Partial<Jugador>) => {
      try {
         const response = await fetch(`${ports.api}/jugador`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jugadorData),
         });

         if (!response.ok) {
            throw new Error(
               `Error al crear el jugador: ${response.statusText}`
            );
         }

         const data: Jugador = await response.json();
         setJugadores((prev) => [data, ...prev]);
         console.log("Jugador creado:", data.CodJugador);
      } catch (error) {
         console.error("Error al crear el jugador:", error);
      }
   };

   const updateJugador = async (
      codigo: string,
      jugadorData: Partial<Jugador>
   ) => {
      try {
         const response = await fetch(`${ports.api}/jugador/${codigo}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jugadorData),
         });

         if (!response.ok) {
            throw new Error(
               `Error al actualizar el jugador: ${response.statusText}`
            );
         }

         const data: Jugador = await response.json();
         setJugadores((prev) =>
            prev.map((j) => (j.CodJugador === data.CodJugador ? data : j))
         );
         console.log("Jugador actualizado:", data.CodJugador);
      } catch (error) {
         console.error("Error al actualizar el jugador:", error);
      }
   };

   const deleteJugadores = async () => {
      try {
         const jugadoresAEliminar = Array.from(selectedToRemove.values());
         const codJugadoresAEliminar = jugadoresAEliminar.map(
            (j) => j.CodJugador
         );

         const results = await Promise.allSettled(
            codJugadoresAEliminar.map((codJugador) =>
               fetch(`${ports.api}/jugador/${codJugador}`, { method: "DELETE" })
            )
         );

         const eliminados: string[] = [];

         results.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value.ok) {
               eliminados.push(codJugadoresAEliminar[index]);
               console.log("Jugador eliminado:", codJugadoresAEliminar[index]);
            } else {
               console.error(
                  `Error al eliminar el jugador ${codJugadoresAEliminar[index]}`
               );
            }
         });

         if (eliminados.length > 0) {
            setJugadores((prev) =>
               prev.filter(
                  (jugador) => !eliminados.includes(jugador.CodJugador)
               )
            );
            setSelectedToRemove(new Map());
         }
      } catch (error) {
         console.error("Error al eliminar los jugadores:", error);
      }
   };

   const filteredJugadores = jugadores.filter((jugador) => {
      const nombreCompleto = `${jugador.Nombre1} ${jugador.Nombre2 || ""} ${
         jugador.Apellido1
      } ${jugador.Apellido2 || ""}`.toLowerCase();
      return nombreCompleto.includes(searchQuery.toLowerCase());
   });

   return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 20 }]}>
         <View style={{ flex: 1, gap: spacings.s2 }}>
            {/* Encabezado */}
            <View style={styles.header}>
               <Text style={styles.headerTitle}>Dashboard de Jugadores</Text>
               <Text style={styles.headerSubtitle}>
                  Puedes gestionar los jugadores de la base de datos
               </Text>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
               <Searchbar
                  value={searchQuery}
                  onChangeText={(query) => setSearchQuery(query)}
                  style={styles.searchInput}
                  placeholder="Buscar jugador por nombre"
               />
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtonsContainer}>
               <TouchableOpacity
                  onPress={() => {
                     setCrudMode("create");
                     presentBottomSheet();
                  }}
                  style={[
                     styles.actionButton,
                     { backgroundColor: colors.white },
                  ]}
               >
                  <FontAwesome
                     name="plus"
                     size={20}
                     color={colors.blue.blue600}
                  />
               </TouchableOpacity>
               <TouchableOpacity
                  onPress={() => {
                     if (crudMode === "delete") {
                        setCrudMode("none");
                        setSelectedToRemove(new Map());
                     } else {
                        setCrudMode("delete");
                     }
                  }}
                  style={[
                     styles.actionButton,
                     {
                        backgroundColor:
                           crudMode === "delete"
                              ? colors.red.red500
                              : colors.gray.gray300,
                     },
                  ]}
               >
                  <FontAwesome
                     name="trash"
                     size={20}
                     color={
                        crudMode === "delete"
                           ? colors.white
                           : colors.gray.gray600
                     }
                  />
               </TouchableOpacity>
               {crudMode === "delete" && (
                  <TouchableOpacity
                     onPress={() => setShowRemoveModal(true)}
                     style={styles.deleteAllButton}
                  >
                     <FontAwesome name="trash" size={20} color={colors.white} />
                     <Text style={styles.actionButtonText}>Eliminar</Text>
                  </TouchableOpacity>
               )}
            </View>

            {/* Lista de jugadores */}
            <FlatList
               data={filteredJugadores}
               keyExtractor={(item) => item.CodJugador}
               numColumns={2}
               columnWrapperStyle={{ gap: spacings.s2 }}
               contentContainerStyle={styles.flatListContent}
               refreshing={refreshing}
               onRefresh={() => {
                  setRefreshing(true);
                  fetchData().finally(() => setRefreshing(false));
               }}
               renderItem={({ item }) => {
                  const isSelectedToRemove = selectedToRemove.has(
                     item.CodJugador
                  );

                  const handleSelect = () => {
                     if (crudMode === "delete") {
                        setSelectedToRemove((prev) => {
                           const newSelection = new Map(prev);
                           if (isSelectedToRemove) {
                              newSelection.delete(item.CodJugador);
                           } else {
                              newSelection.set(item.CodJugador, item);
                           }
                           return newSelection;
                        });
                     } else {
                        setSelected(item);
                        presentBottomSheet();
                     }
                  };

                  return (
                     <TouchableOpacity
                        onPress={handleSelect}
                        style={[
                           styles.playerCard,
                           {
                              backgroundColor: isSelectedToRemove
                                 ? colors.red.red300
                                 : colors.white,
                           },
                        ]}
                     >
                        <Image
                           source={require("../../assets/images/peter-griffin-basketball.gif")}
                           style={styles.playerImage}
                           resizeMode="cover"
                        />
                        <View style={styles.playerInfoContainer}>
                           <Text
                              style={[
                                 styles.playerName,
                                 {
                                    color: isSelectedToRemove
                                       ? colors.white
                                       : colors.gray.gray800,
                                    fontWeight: isSelectedToRemove
                                       ? "bold"
                                       : "400",
                                 },
                              ]}
                           >
                              {item.Nombre1} {item.Nombre2} {item.Apellido1}{" "}
                              {item.Apellido2}
                           </Text>
                           <Text
                              style={[
                                 styles.playerCode,
                                 {
                                    color: isSelectedToRemove
                                       ? colors.white
                                       : colors.gray.gray800,
                                 },
                              ]}
                           >
                              Código: {item.CodJugador}
                           </Text>
                           <Text
                              style={[
                                 styles.playerNumber,
                                 {
                                    color: isSelectedToRemove
                                       ? colors.white
                                       : colors.gray.gray800,
                                 },
                              ]}
                           >
                              Número: {item.Numero}
                           </Text>
                        </View>
                     </TouchableOpacity>
                  );
               }}
            />
         </View>

         {/* Modal para crear o editar jugador */}
         <CBottomSheetModal
            cRef={bottomSheetCreate}
            index={1}
            snapPoints={["60%", "90%"]}
            onDismiss={() => {
               setSelected(null);
               setCrudMode("none");
            }}
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
                  } else {
                     await createJugador(data);
                  }
                  closeBottomSheet();
               }}
               onCancel={() => {
                  closeBottomSheet();
               }}
            />
         </CBottomSheetModal>

         {/* Modal de confirmación para eliminar jugadores */}
         <Modal
            visible={showRemoveModal}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={() => setShowRemoveModal(false)}
         >
            <PopUp
               title="¿Estás seguro de eliminar estos jugadores?"
               subTitle="Las entidades relacionadas a estos jugadores se verán afectadas y es posible que se eliminen."
               onAccept={async () => {
                  await deleteJugadores();
                  setShowRemoveModal(false);
                  setCrudMode("none");
               }}
               onCancel={() => setShowRemoveModal(false)}
            />
         </Modal>
      </SafeAreaView>
   );
};

export default Jugadores;

// Estilos
const styles = StyleSheet.create({
   container: {
      backgroundColor: colors.blueLight,
      flex: 1,
      padding: spacings.s2,
   },
   header: {
      gap: spacings.s1,
   },
   headerTitle: {
      fontSize: fontSizes.medium,
      color: colors.blue.blue900,
      fontWeight: "bold",
   },
   headerSubtitle: {
      fontSize: fontSizes.small,
      color: colors.blue.blue900,
      fontWeight: "400",
   },
   searchContainer: {
      gap: spacings.s2,
      marginBottom: spacings.s1,
   },
   searchInput: {
      backgroundColor: colors.white,
      borderRadius: 8,
   },
   actionButtonsContainer: {
      flexDirection: "row",
      gap: spacings.s2,
   },
   actionButton: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      padding: spacings.s1,
      width: 100,
   },
   actionButtonText: {
      color: colors.white,
      fontSize: fontSizes.small,
      fontWeight: "bold",
   },
   deleteAllButton: {
      flex: 1,
      flexDirection: "row",
      gap: spacings.s1,
      backgroundColor: colors.red.red500,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      padding: spacings.s1,
   },
   flatListContent: {
      gap: spacings.s2,
      paddingBottom: spacings.s2,
   },
   playerCard: {
      flex: 1,
      maxWidth: 190,
      minHeight: 250,
      borderRadius: 10,
      gap: spacings.s2,
      padding: spacings.s1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
   playerImage: {
      width: "100%",
      height: 170,
      borderRadius: 10,
   },
   playerInfoContainer: {
      flex: 1,
      gap: spacings.s1,
   },
   playerName: {
      textAlign: "center",
   },
   playerCode: {
      textAlign: "center",
      fontWeight: "bold",
   },
   playerNumber: {
      textAlign: "center",
      fontWeight: "bold",
   },
});
