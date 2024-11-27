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
import {
   FontAwesome,
   FontAwesome5,
   FontAwesome6,
   Ionicons,
} from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { colors } from "@/UI/colors";
import { fontSizes } from "@/UI/fontSizes";
import { spacings } from "@/UI/spacings";
import { ports } from "@/config/config";
import CBottomSheetModal from "@/components/CBottomsheet";
import PopUp from "@/components/popup/PopUp";
import LottieView from "lottie-react-native";
import { EstadisticaJuego } from "@/interfaces/entities";
import { showMessage } from "react-native-flash-message";
import CiudadFormulario from "@/components/ciudadFormulario/ciudadFormulario";
import EquipoFormulario from "@/components/equipoFormulario/equipoFormulario";
import moment from "moment";
import JuegoFormulario from "@/components/juegoFormulario/juegoFormulario";
import EstadisticaDeJuegoFormulario from "@/components/estadisticaJuegoFormulario/estadisticaJuegoFormulario";

const EstadisticaJuegoDashboard = () => {
   const [entidades, setEntidades] = useState<EstadisticaJuego[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [selected, setSelected] = useState<EstadisticaJuego | null>(null);
   const [selectedToRemove, setSelectedToRemove] = useState<
      Map<string, EstadisticaJuego>
   >(new Map());
   const [crudMode, setCrudMode] = useState<"create" | "delete" | "none">(
      "none"
   );
   const [selectedEntityToSearch, setSelectedEntityToSearch] = useState<
      "juego" | "jugador" | "estadistica" | "none"
   >("none");

   const [refreshing, setRefreshing] = useState(false);
   const [showRemoveModal, setShowRemoveModal] = useState(false);

   const bottomSheetCreate = useRef<BottomSheetModal>(null);
   const insets = useSafeAreaInsets();

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = useCallback(async () => {
      try {
         const response = await fetch(`${ports.api}/estadistica-juego`);
         const data: EstadisticaJuego[] = await response.json();

         setEntidades(data);
      } catch (error) {
         console.error(error);
      }
   }, []);

   const presentBottomSheet = () => bottomSheetCreate.current?.present();
   const closeBottomSheet = () => bottomSheetCreate.current?.close();

   const createEntity = async (formData: Partial<EstadisticaJuego>) => {
      try {
         const response = await fetch(`${ports.api}/estadistica-juego`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            throw new Error(
               `Error al crear la entidad: ${await response.json()}`
            );
         }

         const data: EstadisticaJuego = await response.json();
         setEntidades((prev) => [data, ...prev]);
         showMessage({
            message: "EstadisticaJuego creada",
            backgroundColor: colors.blue.blue400,
            textStyle: { fontSize: fontSizes.regular },
         });
         console.log("entidad creado:", data.CodJuego);
      } catch (error) {
         console.error("Error al crear el entidad:", error);
         showMessage({
            message: "Algo salio mal",
            backgroundColor: colors.red.red500,
         });
      }
   };

   const updateEntity = async (
      x: { codJuego: string; codEstadistica: string; codJugador: string },
      formData: Partial<EstadisticaJuego>
   ) => {
      try {
         const response = await fetch(
            `${ports.api}/estadistica-juego/${x.codJuego}/${x.codEstadistica}/${x.codJugador}`,
            {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(formData),
            }
         );

         if (!response.ok) {
            throw new Error(
               `Error al actualizar la entidad: ${await response.status}`
            );
         }

         const data: EstadisticaJuego = await response.json();
         setEntidades((prev) =>
            prev.map((e) =>
               e.CodEstadistica === x.codEstadistica &&
               e.CodJuego === x.codJuego &&
               e.CodJugador === x.codJugador
                  ? data
                  : e
            )
         );
         showMessage({
            message: "EstadisticaJuego actualizada",
            backgroundColor: colors.blue.blue400,
            textStyle: { fontSize: fontSizes.medium },
         });
         console.log(
            "Entidad actualizado:",
            `${x.codJuego}/${x.codEstadistica}/${x.codJugador}`
         );
      } catch (error) {
         console.error("Error al actualizar la entidad:", error);
         showMessage({
            message: "Algo salio mal",
            backgroundColor: colors.red.red500,
         });
      }
   };

   const deleteEntity = async () => {
      try {
         const entidadesAEliminar = Array.from(selectedToRemove.values());
         const codEntidadAEliminar = entidadesAEliminar.map((j) => ({
            CodJuego: j.CodJuego,
            CodEstadistica: j.CodEstadistica,
            CodJugador: j.CodJugador,
         }));

         const results = await Promise.allSettled(
            codEntidadAEliminar.map((cod) =>
               fetch(
                  `${ports.api}/estadistica-juego/${cod.CodJuego}/${cod.CodEstadistica}/${cod.CodJugador}`,
                  {
                     method: "DELETE",
                  }
               )
            )
         );

         const eliminados: {
            CodJuego: string;
            CodEstadistica: string;
            CodJugador: string;
         }[] = [];

         results.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value.ok) {
               eliminados.push(codEntidadAEliminar[index]);
               console.log("Entidad eliminado:", codEntidadAEliminar[index]);
            } else {
               console.error(
                  `Error al eliminar la entidad ${codEntidadAEliminar[index]}`
               );
            }
         });

         if (eliminados.length > 0) {
            setEntidades((prev) =>
               prev.filter(
                  (e) =>
                     !eliminados.some(
                        (eliminado) =>
                           eliminado.CodEstadistica === e.CodEstadistica &&
                           eliminado.CodJuego === e.CodJuego &&
                           eliminado.CodJugador === e.CodJugador
                     )
               )
            );
            setSelectedToRemove(new Map());
         }
         showMessage({
            message:
               entidadesAEliminar.length > 1
                  ? "Estadisticas de Juegos eliminadas"
                  : "Estadisticas de Juegos eliminada",

            backgroundColor: colors.blue.blue400,
            textStyle: { fontSize: fontSizes.regular },
         });
      } catch (error) {
         console.error("Error al eliminar los entidades:", error);
         showMessage({
            message: "Algo salio mal",
            backgroundColor: colors.red.red500,
         });
      }
   };

   const filteredData = entidades.filter((e) => {
      if (selectedEntityToSearch === "jugador") {
         const nombreCompleto = `${e.jugador?.Nombre1} ${
            e.jugador?.Apellido1 || ""
         }`.toLowerCase();
         return nombreCompleto.includes(searchQuery.toLowerCase());
      } else if (selectedEntityToSearch === "juego") {
         return e.juego?.Descripcion.toLowerCase().includes(
            searchQuery.toLowerCase()
         );
      } else {
         return e.estadistica?.Descripcion.toLowerCase().includes(
            searchQuery.toLowerCase()
         );
      }
   });

   const textSearchBar = () => {
      if (selectedEntityToSearch === "jugador") {
         return "Buscar por el nombre del jugador";
      } else if (selectedEntityToSearch === "juego") {
         return "Buscar por la descripcion del juego";
      } else {
         return "Buscar por la descripcion de la estadistica";
      }
   };

   return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 20 }]}>
         <View style={{ flex: 1, gap: spacings.s2 }}>
            {/* Encabezado */}
            <View style={styles.header}>
               <Text style={styles.headerTitle}>Dashboard de Juegos</Text>
               <Text style={styles.headerSubtitle}>
                  Puedes gestionar las entidades de la base de datos
               </Text>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
               <Searchbar
                  value={searchQuery}
                  onChangeText={(query) => setSearchQuery(query)}
                  style={styles.searchInput}
                  placeholder={textSearchBar()}
               />
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtonsContainer}>
               <TouchableOpacity
                  onPress={() => {
                     if (selectedEntityToSearch === "jugador") {
                        setSelectedEntityToSearch("none");
                        setSearchQuery("");
                     } else setSelectedEntityToSearch("jugador");
                  }}
                  style={[
                     styles.actionButton,
                     {
                        backgroundColor:
                           selectedEntityToSearch === "jugador"
                              ? colors.blue.blue500
                              : colors.white,
                        flex: 1,
                     },
                  ]}
               >
                  <FontAwesome6
                     name="person"
                     size={20}
                     color={
                        selectedEntityToSearch === "jugador"
                           ? colors.white
                           : colors.blue.blue600
                     }
                  />
               </TouchableOpacity>
               <TouchableOpacity
                  onPress={() => {
                     if (selectedEntityToSearch === "juego") {
                        setSelectedEntityToSearch("none");
                        setSearchQuery("");
                     } else setSelectedEntityToSearch("juego");
                  }}
                  style={[
                     styles.actionButton,
                     {
                        backgroundColor:
                           selectedEntityToSearch === "juego"
                              ? colors.blue.blue500
                              : colors.white,
                        flex: 1,
                     },
                  ]}
               >
                  <FontAwesome5
                     name="basketball-ball"
                     size={20}
                     color={
                        selectedEntityToSearch === "juego"
                           ? colors.white
                           : colors.blue.blue600
                     }
                  />
               </TouchableOpacity>
               <TouchableOpacity
                  onPress={() => {
                     if (selectedEntityToSearch === "estadistica") {
                        setSelectedEntityToSearch("none");
                        setSearchQuery("");
                     } else setSelectedEntityToSearch("estadistica");
                  }}
                  style={[
                     styles.actionButton,
                     {
                        backgroundColor:
                           selectedEntityToSearch === "estadistica"
                              ? colors.blue.blue500
                              : colors.white,
                        flex: 1,
                     },
                  ]}
               >
                  <Ionicons
                     name="newspaper"
                     size={20}
                     color={
                        selectedEntityToSearch === "estadistica"
                           ? colors.white
                           : colors.blue.blue600
                     }
                  />
               </TouchableOpacity>
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
                     onPress={() =>
                        selectedToRemove.size > 0 && setShowRemoveModal(true)
                     }
                     style={styles.deleteAllButton}
                  >
                     <FontAwesome name="trash" size={20} color={colors.white} />
                     <Text style={styles.actionButtonText}>Eliminar</Text>
                  </TouchableOpacity>
               )}
            </View>

            {/* Lista de entidades */}
            <FlatList
               data={filteredData}
               keyExtractor={(item) =>
                  `${item.CodJuego}/${item.CodEstadistica}/${item.CodJugador}`
               }
               numColumns={2}
               columnWrapperStyle={{ gap: spacings.s2 }}
               contentContainerStyle={styles.flatListContent}
               refreshing={refreshing}
               onRefresh={() => {
                  setRefreshing(true);
                  fetchData().finally(() => setRefreshing(false));
               }}
               renderItem={({ item }) => {
                  const id = `${item.CodJuego}/${item.CodEstadistica}/${item.CodJugador}`;
                  const isSelectedToRemove = selectedToRemove.has(id);

                  const handleSelect = () => {
                     if (crudMode === "delete") {
                        setSelectedToRemove((prev) => {
                           const newSelection = new Map(prev);
                           if (isSelectedToRemove) {
                              newSelection.delete(id);
                           } else {
                              newSelection.set(id, item);
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
                        <LottieView
                           autoPlay
                           loop
                           style={styles.playerImage}
                           source={require("../../assets/lotties/palomos.json")}
                        />
                        <View style={styles.playerInfoContainer}>
                           <Text
                              style={[
                                 styles.playerCode,
                                 {
                                    color: isSelectedToRemove
                                       ? colors.white
                                       : colors.gray.gray800,
                                    fontWeight: "bold",
                                 },
                              ]}
                           >
                              Juego: {item.juego?.Descripcion}
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
                              Estadistica: {item.estadistica?.Descripcion}
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
                              Jugador: {item.jugador?.Nombre1}{" "}
                              {item.jugador?.Apellido1}
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
                              Total:
                              {(item.estadistica?.Valor ?? 0) * item.Cantidad}
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
            <EstadisticaDeJuegoFormulario
               initialData={selected}
               onAccept={async (form) => {
                  if (selected) {
                     await updateEntity(
                        {
                           codEstadistica: selected.CodEstadistica,
                           codJuego: selected.CodJuego,
                           codJugador: selected.CodJugador,
                        },
                        {
                           Cantidad: Number(form.Cantidad),
                        }
                     );
                  } else {
                     if (
                        form.estadistica == undefined &&
                        form.juego == undefined &&
                        form.jugador == undefined
                     ) {
                        console.error("Las variables son undefined");
                        return;
                     }
                     await createEntity({
                        CodEstadistica: form.estadistica!.CodEstadistica,
                        CodJuego: form.juego!.CodJuego,
                        CodJugador: form.jugador!.CodJugador,
                        Cantidad: Number(form.Cantidad),
                     });
                  }
                  closeBottomSheet();
               }}
               onCancel={() => {
                  closeBottomSheet();
               }}
            />
         </CBottomSheetModal>

         {/* Modal de confirmación para eliminar entidades */}
         <Modal
            visible={showRemoveModal}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={() => setShowRemoveModal(false)}
         >
            <PopUp
               title="¿Estás seguro de eliminar estas entidades?"
               subTitle="Las entidades relacionadas a estos entidades se verán afectadas y es posible que se eliminen."
               onAccept={async () => {
                  await deleteEntity();
                  setShowRemoveModal(false);
                  setCrudMode("none");
               }}
               onCancel={() => setShowRemoveModal(false)}
            />
         </Modal>
      </SafeAreaView>
   );
};

export default EstadisticaJuegoDashboard;

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
