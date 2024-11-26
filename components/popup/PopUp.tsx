import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { spacings } from "@/UI/spacings";
import { colors } from "@/UI/colors";
import { fontSizes } from "@/UI/fontSizes";

export interface Props {
   onCancel: () => void;
   onAccept: () => Promise<void>;
   title?: string;
   subTitle?: string;
}

export default function PopUp({ onAccept, onCancel, title, subTitle }: Props) {
   const [loading, setLoading] = useState(false);

   const handleAccept = async () => {
      setLoading(true);
      try {
         await onAccept();
      } finally {
         setLoading(false);
      }
   };

   return (
      <View style={styles.modalOverlay}>
         <View style={styles.container}>
            <View style={styles.textContainer}>
               {title && <Text style={styles.title}>{title}</Text>}
               {subTitle && <Text style={styles.subtitle}>{subTitle}</Text>}
            </View>
            <View style={styles.buttonContainer}>
               <Button
                  disabled={loading}
                  onPress={onCancel}
                  labelStyle={styles.buttonLabel}
                  contentStyle={styles.cancelButtonContent}
                  style={styles.button}
               >
                  Cancelar
               </Button>
               <Button
                  disabled={loading}
                  loading={loading}
                  onPress={handleAccept}
                  labelStyle={styles.buttonLabel}
                  contentStyle={styles.acceptButtonContent}
                  style={styles.button}
               >
                  Eliminar
               </Button>
            </View>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacings.s2,
   },
   container: {
      backgroundColor: colors.white,
      padding: spacings.s2,
      maxHeight: "30%",
      borderRadius: 10,
      justifyContent: "center",
      width: "100%",
   },
   textContainer: {
      gap: spacings.s1,
      alignItems: "center",
   },
   title: {
      fontSize: fontSizes.regular + 2,
      color: colors.blue.blue900,
      fontWeight: "bold",
      textAlign: "center",
   },
   subtitle: {
      fontSize: fontSizes.vsmall,
      color: colors.blue.blue900,
      fontWeight: "400",
      textAlign: "center",
   },
   buttonContainer: {
      flexDirection: "row",
      gap: spacings.s2,
      marginTop: spacings.s4,
   },
   button: {
      flex: 1,
   },
   buttonLabel: {
      color: colors.white,
   },
   cancelButtonContent: {
      backgroundColor: colors.blue.blue800,
   },
   acceptButtonContent: {
      backgroundColor: colors.red.red500,
   },
});
