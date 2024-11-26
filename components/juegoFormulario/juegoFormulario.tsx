import React, { useEffect, useState } from "react";
import {
   TouchableOpacity,
   View,
   Platform,
   Modal,
   StyleSheet,
} from "react-native";
import {
   useForm,
   Controller,
   RegisterOptions,
   FieldValues,
   Control,
   FieldErrors,
   Path,
} from "react-hook-form";
import { spacings } from "@/UI/spacings";
import { fontSizes } from "@/UI/fontSizes";
import { colors } from "@/UI/colors";
import { TextInput, Text, Button, TextInputProps } from "react-native-paper";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ciudad, Equipo, Juego } from "@/interfaces/entities";
import Selector from "../selectorEntidad/SelectorEntidad";
import { ports } from "@/config/config";
import {
   CiudadSelectorField,
   DatePickerField,
   EquipoSelectorField,
} from "../jugadorFormulario/jugadorFormulario";
import moment from "moment";

export type FormularioJuego = Pick<
   Juego,
   "Descripcion" | "Fecha" | "Equipo1Entity" | "Equipo2Entity"
>;

export interface Props {
   onAccept: (form: FormularioJuego) => Promise<void>;
   onCancel: () => void;
   initialData?: Juego | null;
}

export default function JuegoFormulario({
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
      watch,
   } = useForm<FormularioJuego>({
      defaultValues: {
         Descripcion: "",
         Equipo1Entity: undefined,
         Equipo2Entity: undefined,
         Fecha: new Date(),
      },
   });

   useEffect(() => {
      const initialize = async () => {
         if (initialData) {
            const [Equipo1Entity, Equipo2Entity] = await Promise.all([
               findEquipo(initialData.Equipo1),
               findEquipo(initialData.Equipo2),
            ]);

            reset({
               Descripcion: initialData.Descripcion,
               Fecha: moment(initialData.Fecha).toDate(),
               Equipo1Entity,
               Equipo2Entity,
            });
         }
      };
      initialize();
   }, [initialData, reset]);

   const onSubmit = async (data: FormularioJuego) => {
      setLoading(true);
      onAccept(data).finally(() => setLoading(false));
   };

   const findEquipo = async (codigo: string) => {
      try {
         const response = await fetch(`${ports.api}/equipo/${codigo}`, {
            method: "GET",
         });
         const data: Equipo = await response.json();
         return data;
      } catch (error) {
         console.error(error);
      }
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
                     ? "Informacion del equipo"
                     : "Crear nuevo equipo"}
               </Text>
               <Text style={styles.subtitle}>
                  {initialData
                     ? "Puedes actualizar la informacion de este equipo"
                     : "Llena este formulario para agregar un nuevo equipo en la base de datos"}
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
               <DatePickerField
                  label="Fecha del juego"
                  name="Fecha"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  errors={errors}
               />
               <EquipoSelectorField<FormularioJuego>
                  label="Equipo Local"
                  name="Equipo1Entity"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  initial={watch("Equipo1Entity")}
                  errors={errors}
               />
               <EquipoSelectorField<FormularioJuego>
                  label="Equipo visitante"
                  name="Equipo2Entity"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  initial={watch("Equipo2Entity")}
                  errors={errors}
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
