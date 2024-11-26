import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller, RegisterOptions, Control } from "react-hook-form";
import { spacings } from "@/UI/spacings";
import { fontSizes } from "@/UI/fontSizes";
import { colors } from "@/UI/colors";
import { TextInput, Text, Button, TextInputProps } from "react-native-paper";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Estadistica } from "@/interfaces/entities";

export type FormularioEstadistica = Pick<Estadistica, "Descripcion"> & {
   Valor: string;
};

export interface Props {
   onAccept: (form: FormularioEstadistica) => Promise<void>;
   onCancel: () => void;
   initialData?: Estadistica | null;
}

export default function EstadisticaFormulario({
   onAccept,
   onCancel,
   initialData,
}: Props) {
   const [loading, setLoading] = useState(false);

   const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
   } = useForm<FormularioEstadistica>({
      defaultValues: {
         Descripcion: "",
         Valor: "0",
      },
   });

   useEffect(() => {
      const initialize = async () => {
         if (initialData) {
            reset({
               Descripcion: initialData.Descripcion,
               Valor: initialData.Valor.toString(),
            });
         }
      };
      initialize();
   }, [initialData, reset]);

   const onSubmit = async (data: FormularioEstadistica) => {
      setLoading(true);
      onAccept(data).finally(() => setLoading(false));
   };

   return (
      <BottomSheetScrollView
         contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            padding: spacings.s2,
         }}
      >
         <View style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
               <Text style={styles.title}>
                  {initialData
                     ? "Informacion de la estadistica"
                     : "Crear nueva estadistica"}
               </Text>
               <Text style={styles.subtitle}>
                  {initialData
                     ? "Puedes actualizar la informacion de esta estadistca"
                     : "Llena este formulario para agregar una nueva estadistica en la base de datos"}
               </Text>
            </View>
            {/* Campos del Formulario */}
            <View style={styles.form}>
               <TextInputField
                  label="Descripcion"
                  name="Descripcion"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  errors={errors}
               />
               <TextInputField
                  label="Valor"
                  name="Valor"
                  control={control}
                  rules={{
                     required: "Este campo es obligatorio",
                     min: {
                        value: 1,
                        message: "El valor debe ser mayor que 0",
                     },
                  }}
                  errors={errors}
                  textInputProps={{
                     keyboardType: "numeric",
                  }}
               />
            </View>
         </View>
         {/* Botones */}
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
               disabled={loading}
               loading={loading}
               onPress={handleSubmit(onSubmit)}
               labelStyle={{ color: colors.white }}
               contentStyle={styles.acceptButtonContent}
               style={styles.acceptButton}
               mode="contained"
            >
               {initialData ? "Actualizar" : "Aceptar"}
            </Button>
         </View>
      </BottomSheetScrollView>
   );
}

const TextInputField = ({
   label,
   name,
   control,
   rules,
   errors,
   textInputProps,
}: {
   label: string;
   name: string;
   errors: { [x: string]: any };
   control: Control<any, any>;
   rules?:
      | Omit<
           RegisterOptions<any, any>,
           "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
        >
      | undefined;
   textInputProps?: TextInputProps;
}) => (
   <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Controller
         control={control}
         name={name}
         rules={rules}
         render={({ field: { onChange, onBlur, value } }) => {
            return (
               <TextInput
                  {...textInputProps}
                  mode="outlined"
                  style={styles.textInput}
                  activeOutlineColor={colors.blue.blue600}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(text)}
                  value={value ?? ""}
                  error={!!errors[name]}
               />
            );
         }}
      />
      {errors[name] && (
         <Text style={styles.errorText}>{errors[name]?.message}</Text>
      )}
   </View>
);

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   header: {
      marginBottom: spacings.s2,
   },
   title: {
      fontSize: fontSizes.medium,
      color: colors.blue.blue900,
      fontWeight: "bold",
   },
   subtitle: {
      fontSize: fontSizes.small,
      color: colors.blue.blue900,
      fontWeight: "400",
   },
   form: {
      gap: spacings.s2,
   },
   fieldContainer: {
      marginBottom: spacings.s2,
   },
   fieldLabel: {
      fontSize: fontSizes.regular,
      color: colors.blue.blue900,
      fontWeight: "bold",
      marginBottom: spacings.s1,
   },
   textInput: {
      flex: 1,
   },
   errorText: {
      color: colors.red.red500,
      marginTop: spacings.s1,
   },
   datePickerButton: {
      width: "100%",
      height: 60,
      backgroundColor: colors.white,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
   },
   datePickerText: {
      fontSize: fontSizes.regular,
      fontWeight: "bold",
      width: "100%",
      textAlign: "center",
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacings.s2,
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
});
