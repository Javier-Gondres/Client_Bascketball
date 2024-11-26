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
import CBottomSheetModal from "@/components/CBottomsheet";
import JugadorFormulario from "@/components/jugadorFormulario/jugadorFormulario";
import PopUp from "@/components/popup/PopUp";
import LottieView from "lottie-react-native";
import { Ciudad, Jugador } from "@/interfaces/entities";
import { showMessage, hideMessage } from "react-native-flash-message";
import CiudadFormulario from "@/components/ciudadFormulario/ciudadFormulario";

const Ciudades = () => {
   const [entidades, setEntidades] = useState<Ciudad[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [selected, setSelected] = useState<Ciudad | null>(null);
   const [selectedToRemove, setSelectedToRemove] = useState<
      Map<string, Ciudad>
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
         const response = await fetch(`${ports.api}/ciudad`);
         const data: Ciudad[] = await response.json();

         setEntidades(data);
      } catch (error) {
         console.error(error);
      }
   }, []);

   const presentBottomSheet = () => bottomSheetCreate.current?.present();
   const closeBottomSheet = () => bottomSheetCreate.current?.close();

   const createEntity = async (formData: Partial<Ciudad>) => {
      try {
         const response = await fetch(`${ports.api}/ciudad`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            throw new Error(
               `Error al crear la entidad: ${await response.json()}`
            );
         }

         const data: Ciudad = await response.json();
         setEntidades((prev) => [data, ...prev]);
         showMessage({
            message: "Ciudad creada",
            backgroundColor: colors.blue.blue400,
            textStyle: { fontSize: fontSizes.regular },
         });
         console.log("entidad creado:", data.CodCiudad);
      } catch (error) {
         console.error("Error al crear el entidad:", error);
         showMessage({
            message: "Algo salio mal",
            backgroundColor: colors.red.red500,
         });
      }
   };

   const updateEntity = async (codigo: string, formData: Partial<Ciudad>) => {
      try {
         console.log({ codigo });
         const response = await fetch(`${ports.api}/ciudad/${codigo}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            throw new Error(
               `Error al actualizar la entidad: ${await response.status}`
            );
         }

         const data: Ciudad = await response.json();
         setEntidades((prev) =>
            prev.map((e) => (e.CodCiudad === data.CodCiudad ? data : e))
         );
         showMessage({
            message: "Ciudad actualizada",
            backgroundColor: colors.blue.blue400,
            textStyle: { fontSize: fontSizes.medium },
         });
         console.log("Entidad actualizado:", data.CodCiudad);
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
         const codEntidadAEliminar = entidadesAEliminar.map((j) => j.CodCiudad);

         const results = await Promise.allSettled(
            codEntidadAEliminar.map((codJugador) =>
               fetch(`${ports.api}/ciudad/${codJugador}`, { method: "DELETE" })
            )
         );

         const eliminados: string[] = [];

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
               prev.filter((jugador) => !eliminados.includes(jugador.CodCiudad))
            );
            setSelectedToRemove(new Map());
         }
         showMessage({
            message:
               entidadesAEliminar.length > 1
                  ? "Ciudades eliminadas"
                  : "Ciudad eliminada",

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
      return e.Nombre.toLowerCase().includes(searchQuery.toLowerCase());
   });

   return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 20 }]}>
         <View style={{ flex: 1, gap: spacings.s2 }}>
            {/* Encabezado */}
            <View style={styles.header}>
               <Text style={styles.headerTitle}>Dashboard de Ciudades</Text>
               <Text style={styles.headerSubtitle}>
                  Puedes gestionar los entidades de la base de datos
               </Text>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
               <Searchbar
                  value={searchQuery}
                  onChangeText={(query) => setSearchQuery(query)}
                  style={styles.searchInput}
                  placeholder="Buscar ciudad por nombre"
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
               keyExtractor={(item) => item.CodCiudad}
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
                     item.CodCiudad
                  );

                  const handleSelect = () => {
                     if (crudMode === "delete") {
                        setSelectedToRemove((prev) => {
                           const newSelection = new Map(prev);
                           if (isSelectedToRemove) {
                              newSelection.delete(item.CodCiudad);
                           } else {
                              newSelection.set(item.CodCiudad, item);
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
                           duration={20000}
                           speed={1}
                           style={styles.playerImage}
                           source={require("../../assets/lotties/city.json")}
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
                              {item.Nombre}
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
                              Código: {item.CodCiudad}
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
            <CiudadFormulario
               initialData={selected}
               onAccept={async (form) => {
                  if (selected) {
                     await updateEntity(selected.CodCiudad, form);
                  } else {
                     await createEntity(form);
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

export default Ciudades;

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
