import React, { useEffect, useState, useCallback } from "react";
import {
   View,
   Text,
   FlatList,
   TouchableOpacity,
   StyleSheet,
} from "react-native";
import { Button } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { ports } from "@/config/config";
import { spacings } from "@/UI/spacings";
import { fontSizes } from "@/UI/fontSizes";
import { colors } from "@/UI/colors";

export interface SelectorProps<T> {
   onAccept: (item: T) => void;
   onCancel: () => void;
   fetchUrl: string;
   keyExtractor: (item: T) => string;
   labelExtractor: (item: T) => string;
   headerTitle: string;
   headerSubtitle: string;
}

export default function SelectorEntidad<T>({
   onAccept,
   onCancel,
   fetchUrl,
   keyExtractor,
   labelExtractor,
   headerTitle,
   headerSubtitle,
}: SelectorProps<T>) {
   const [selected, setSelected] = useState<T | null>(null);
   const [entities, setEntities] = useState<T[]>([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const response = await fetch(fetchUrl);
            const data: T[] = await response.json();
            setEntities(data);
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      fetchData();
   }, [fetchUrl]);

   const handleSelect = useCallback(
      (item: T) => {
         const itemKey = keyExtractor(item);
         const selectedKey = selected ? keyExtractor(selected) : null;
         setSelected(selectedKey === itemKey ? null : item);
      },
      [keyExtractor, selected]
   );

   const renderItem = useCallback(
      ({ item }: { item: T }) => {
         const itemKey = keyExtractor(item);
         const selectedKey = selected ? keyExtractor(selected) : null;
         const isSelected = selectedKey === itemKey;

         return (
            <View style={styles.itemContainer}>
               <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={[
                     styles.selectButton,
                     isSelected && styles.selectButtonSelected,
                  ]}
               >
                  {isSelected && (
                     <FontAwesome name="check" size={20} color={colors.white} />
                  )}
               </TouchableOpacity>
               <Text style={styles.itemText}>{labelExtractor(item)}</Text>
            </View>
         );
      },
      [handleSelect, keyExtractor, labelExtractor, selected]
   );

   const listHeaderComponent = (
      <View style={styles.headerContainer}>
         <Text style={styles.headerTitle}>{headerTitle}</Text>
         <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
      </View>
   );

   return (
      <View style={styles.container}>
         <FlatList
            data={entities}
            keyExtractor={(item) => keyExtractor(item)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={listHeaderComponent}
         />
         <View style={styles.buttonContainer}>
            <Button
               onPress={onCancel}
               labelStyle={{ color: colors.blue.blue500 }}
               contentStyle={styles.cancelButtonContent}
               style={styles.cancelButton}
               mode="contained"
            >
               Cancelar
            </Button>
            <Button
               disabled={!selected}
               onPress={() => selected && onAccept(selected)}
               labelStyle={{ color: colors.white }}
               contentStyle={[
                  styles.acceptButtonContent,
                  !selected && styles.acceptButtonDisabled,
               ]}
               style={styles.acceptButton}
               mode="contained"
            >
               Aceptar
            </Button>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
			width: '100%',
      backgroundColor: colors.blue.blue100,
      borderRadius: 10,
      padding: spacings.s4,
   },
   listContent: {
      gap: spacings.s2,
   },
   headerContainer: {
      marginBottom: spacings.s2,
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
   itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacings.s2,
   },
   selectButton: {
      width: 50,
      height: 50,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.blue.blue700,
      borderWidth: 1,
   },
   selectButtonSelected: {
      backgroundColor: colors.blue.blue700,
   },
   itemText: {
      fontSize: fontSizes.small,
      color: colors.blue.blue900,
      fontWeight: "400",
      flex: 1,
   },
   buttonContainer: {
      flexDirection: "row",
      gap: spacings.s2,
      marginTop: spacings.s4,
   },
   cancelButton: {
      flex: 1,
   },
   cancelButtonContent: {
      backgroundColor: colors.white,
      height: 50,
   },
   acceptButton: {
      flex: 1,
   },
   acceptButtonContent: {
      backgroundColor: colors.blue.blue500,
      height: 50,
   },
   acceptButtonDisabled: {
      backgroundColor: colors.gray.gray300,
   },
});
