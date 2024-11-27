import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import {
   Ciudad,
   Equipo,
   Estadistica,
   EstadisticaJuego,
   Juego,
   Jugador,
} from "@/interfaces/entities";
import Selector from "../selectorEntidad/SelectorEntidad";
import { ports } from "@/config/config";
import {
   CiudadSelectorField,
   DatePickerField,
   EquipoSelectorField,
   EstadisticaSelectorField,
   JuegoSelectorField,
   JugadorSelectorField,
} from "../jugadorFormulario/jugadorFormulario";
import moment from "moment";
import { showMessage } from "react-native-flash-message";

export type FormularioEstadisticaJueg = Pick<
   EstadisticaJuego,
   "estadistica" | "juego" | "jugador"
> & {
   Cantidad: string;
};

export interface Props {
   onAccept: (form: FormularioEstadisticaJueg) => Promise<void>;
   onCancel: () => void;
   initialData?: EstadisticaJuego | null;
}

export default function EstadisticaDeJuegoFormulario({
   onAccept,
   onCancel,
   initialData,
}: Props) {
   const [loading, setLoading] = useState(false);
   const [puntos, setPuntos] = useState(0);

   const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
      watch,
      setValue,
      setError,
   } = useForm<FormularioEstadisticaJueg>({
      defaultValues: {
         Cantidad: "",
         estadistica: undefined,
         juego: undefined,
         jugador: undefined,
      },
   });

   const { estadistica, juego, jugador, Cantidad } = watch();

   useEffect(() => {
      const initialize = async () => {
         if (initialData) {
            const [juego, estadistica, jugador] = await Promise.all([
               findJuego(initialData.CodJuego),
               findEstadistica(initialData.CodEstadistica),
               findJugador(initialData.CodJugador),
            ]);

            reset({
               Cantidad: initialData.Cantidad.toString(),
               juego,
               estadistica,
               jugador,
            });
         }
      };
      initialize();
   }, [initialData, reset]);

   useLayoutEffect(() => {
      if (!juego) {
         setValue("jugador", undefined);
         setValue("estadistica", undefined);
      }

      if (juego && jugador) {
         if (
            jugador.CodEquipo !== juego.Equipo1 &&
            jugador.CodEquipo !== juego.Equipo2
         ) {
            showMessage({
               message:
                  "El jugador: " +
                  jugador.Nombre1 +
                  " no pertenece a ninguno de los equipos del juego",
               backgroundColor: colors.red.red500,
            });
            setValue("jugador", undefined);
            setValue("estadistica", undefined);
         }
      }

      if (estadistica) {
         setPuntos(Number(Cantidad) * estadistica.Valor);
      } else {
         setPuntos(0);
      }
   }, [juego, jugador, estadistica, Cantidad]);

   const onSubmit = async (data: FormularioEstadisticaJueg) => {
      setLoading(true);
      onAccept(data).finally(() => setLoading(false));
   };

   const findJugador = async (codigo: string) => {
      try {
         const response = await fetch(`${ports.api}/jugador/${codigo}`, {
            method: "GET",
         });
         const data: Jugador = await response.json();
         return data;
      } catch (error) {
         console.error(error);
      }
   };
   const findJuego = async (codigo: string) => {
      try {
         const response = await fetch(`${ports.api}/juego/${codigo}`, {
            method: "GET",
         });
         const data: Juego = await response.json();
         return data;
      } catch (error) {
         console.error(error);
      }
   };
   const findEstadistica = async (codigo: string) => {
      try {
         const response = await fetch(`${ports.api}/estadistica/${codigo}`, {
            method: "GET",
         });
         const data: Estadistica = await response.json();
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
                  label="Cantidad"
                  name="Cantidad"
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
               <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Puntos del jugador</Text>
                  <View
                     style={{
                        width: "100%",
                        height: 60,
                        backgroundColor: colors.gray.gray300,
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.blue.blue500,
                     }}
                  >
                     <Text
                        style={{
                           fontSize: fontSizes.regular,
                           fontWeight: "bold",
                           width: "100%",
                           textAlign: "center",
                           color: colors.blue.blue800,
                        }}
                     >
                        {puntos}
                     </Text>
                  </View>
               </View>

               <JuegoSelectorField<FormularioEstadisticaJueg>
                  desactivarBUtton={
                     initialData !== null && initialData !== undefined
                  }
                  label="Juego"
                  name="juego"
                  control={control}
                  rules={{
                     required: initialData
                        ? "Este campo es obligatorio"
                        : undefined,
                  }}
                  initial={juego}
                  errors={errors}
               />
               <JugadorSelectorField<FormularioEstadisticaJueg>
                  desactivarBUtton={
                     initialData !== null && initialData !== undefined
                  }
                  desactivar={true}
                  label="Jugador"
                  name="jugador"
                  control={control}
                  rules={{
                     required: initialData
                        ? "Este campo es obligatorio"
                        : undefined,
                  }}
                  initial={jugador}
                  errors={errors}
                  juegoElegido={juego}
                  action={() => setValue("estadistica", undefined)}
               />
               <EstadisticaSelectorField<FormularioEstadisticaJueg>
                  desactivarBUtton={
                     initialData !== null && initialData !== undefined
                  }
                  label="Estadistica del jugador"
                  name="estadistica"
                  control={control}
                  rules={{
                     required: initialData
                        ? "Este campo es obligatorio"
                        : undefined,
                  }}
                  initial={estadistica}
                  errors={errors}
                  juegoElegido={juego}
                  jugadorElegido={jugador}
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
