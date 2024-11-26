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
import { Ciudad, Equipo, Jugador } from "@/interfaces/entities";
import Selector from "../selectorEntidad/SelectorEntidad";
import { ports } from "@/config/config";

export interface FormularioJugador {
   primerNombre: string;
   segundoNombre: string | null;
   primerApellido: string;
   segundoApellido: string | null;
   fechaNacimiento: Date;
   ciudadDeNacimiento: Ciudad | null;
   equipo: Equipo | null;
   numero: string;
}

export interface Props {
   onAccept: (form: FormularioJugador) => Promise<void>;
   onCancel: () => void;
   initialJugador?: Jugador | null;
}

export default function JugadorFormulario({
   onAccept,
   onCancel,
   initialJugador,
}: Props) {
   const [loading, setLoading] = useState(false);

   const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
      watch,
      reset,
   } = useForm<FormularioJugador>({
      defaultValues: {
         primerNombre: "",
         segundoNombre: null,
         primerApellido: "",
         segundoApellido: null,
         numero: "",
         fechaNacimiento: new Date(),
         ciudadDeNacimiento: null,
         equipo: null,
      },
   });

   useEffect(() => {
      const initialize = async () => {
         if (initialJugador) {
            let ciudad = null;
            let equipo = null;

            if (initialJugador.CiudadNacim) {
               ciudad = await findCiudad(initialJugador.CiudadNacim);
            }
            if (initialJugador.CodEquipo) {
               equipo = await findEquipo(initialJugador.CodEquipo);
            }

            reset({
               primerNombre: initialJugador.Nombre1 || "",
               segundoNombre: initialJugador.Nombre2 || null,
               primerApellido: initialJugador.Apellido1 || "",
               segundoApellido: initialJugador.Apellido2 || null,
               numero: initialJugador.Numero || "",
               fechaNacimiento: initialJugador.FechaNacim
                  ? new Date(initialJugador.FechaNacim)
                  : new Date(),
               ciudadDeNacimiento: ciudad,
               equipo,
            });
         }
      };
      initialize();
   }, [initialJugador, reset]);

   const onSubmit = async (data: FormularioJugador) => {
      setLoading(true);
      //   if (data.equipo) {
      //      const jugadores = await findOtherPlayerWithSameNumber(
      //         data.numero,
      //         data.equipo.CodEquipo
      //      );

      //      if (jugadores.length > 0) {
      //         setError("numero", {
      //            message: "Ya hay un jugador con este numero en el equipo",
      //         });
      //      }
      //      setLoading(false);
      //      return;
      //   }
      onAccept(data).finally(() => setLoading(false));
   };

   const findCiudad = async (codigo: string) => {
      try {
         const response = await fetch(`${ports.api}/ciudad/${codigo}`, {
            method: "GET",
         });
         const data: Ciudad = await response.json();
         return data;
      } catch (error) {
         console.error(error);
      }
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
      <BottomSheetScrollView style={{ flexGrow: 1 }}>
         <View style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
               <Text style={styles.title}>Crear nuevo jugador</Text>
               <Text style={styles.subtitle}>
                  Llena este formulario para crear un nuevo jugador en la base
                  de datos
               </Text>
            </View>
            {/* Campos del Formulario */}
            <View style={styles.form}>
               <TextInputField
                  label="Primer nombre"
                  name="primerNombre"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  errors={errors}
               />
               <TextInputField
                  label="Segundo nombre"
                  name="segundoNombre"
                  control={control}
                  errors={errors}
               />
               <TextInputField
                  label="Primer apellido"
                  name="primerApellido"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  errors={errors}
               />
               <TextInputField
                  label="Segundo apellido"
                  name="segundoApellido"
                  control={control}
                  errors={errors}
               />
               <TextInputField
                  label="Numero de jugador"
                  name="numero"
                  control={control}
                  rules={{
                     required: "Este campo es obligatorio",
                     pattern: {
                        value: /^[0-9]{1,2}$/,
                        message: "Ingrese un número válido de hasta 2 dígitos",
                     },
                     minLength: {
                        value: 2,
                        message: "Debe ingresar 2 digitos",
                     },
                  }}
                  errors={errors}
                  textInputProps={{
                     maxLength: 2,
                     keyboardType: "numeric",
                     placeholder: "00",
                  }}
               />
               <DatePickerField
                  label="Fecha de nacimiento"
                  name="fechaNacimiento"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  errors={errors}
               />
               <CiudadSelectorField
                  label="Ciudad de nacimiento"
                  name="ciudadDeNacimiento"
                  control={control}
                  initial={watch("ciudadDeNacimiento")}
                  errors={errors}
               />
               <EquipoSelectorField<FormularioJugador>
                  label="Equipo"
                  name="equipo"
                  control={control}
                  initial={watch("equipo")}
                  errors={errors}
               />
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
                     {initialJugador ? "Actualizar" : "Aceptar"}
                  </Button>
               </View>
            </View>
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

const DatePickerField = ({
   label,
   name,
   control,
   rules,
   errors,
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
}) => {
   const [showDatePicker, setShowDatePicker] = useState(false);

   return (
      <View style={styles.fieldContainer}>
         <Text style={styles.fieldLabel}>{label}</Text>
         <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value } }) => (
               <>
                  <TouchableOpacity
                     onPress={() => setShowDatePicker(true)}
                     style={[
                        styles.datePickerButton,
                        {
                           borderColor: errors[name]
                              ? colors.red.red500
                              : colors.blue.blue600,
                        },
                     ]}
                  >
                     <Text
                        style={[
                           styles.datePickerText,
                           {
                              color: value
                                 ? colors.blue.blue900
                                 : colors.gray.gray500,
                           },
                        ]}
                     >
                        {value
                           ? value.toLocaleDateString()
                           : "Selecciona una fecha"}
                     </Text>
                  </TouchableOpacity>
                  {errors[name] && (
                     <Text style={styles.errorText}>
                        {errors[name]?.message}
                     </Text>
                  )}
                  {showDatePicker && (
                     <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                           if (Platform.OS !== "ios") {
                              setShowDatePicker(false);
                           }
                           if (event.type === "set" && selectedDate) {
                              onChange(selectedDate);
                           }
                        }}
                        maximumDate={new Date()}
                     />
                  )}
               </>
            )}
         />
      </View>
   );
};

function CiudadSelectorField({
   label,
   name,
   control,
   rules,
   errors,
   initial,
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
   initial?: Ciudad | null;
}) {
   const [showCitySelector, setShowCitySelector] = useState(false);

   return (
      <View style={styles.fieldContainer}>
         <Text style={styles.fieldLabel}>{label}</Text>
         <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value } }) => (
               <>
                  <TouchableOpacity
                     onPress={() => setShowCitySelector(true)}
                     style={[
                        styles.datePickerButton,
                        {
                           borderColor: errors[name]
                              ? colors.red.red500
                              : colors.blue.blue600,
                        },
                     ]}
                  >
                     <Text
                        style={[
                           styles.datePickerText,
                           {
                              color: value
                                 ? colors.blue.blue900
                                 : colors.gray.gray500,
                           },
                        ]}
                     >
                        {value ? value.Nombre : "Selecciona la ciudad"}
                     </Text>
                  </TouchableOpacity>
                  {errors[name] && (
                     <Text style={styles.errorText}>
                        {errors[name]?.message}
                     </Text>
                  )}
                  <Modal
                     visible={showCitySelector}
                     transparent={true}
                     animationType="slide"
                     onRequestClose={() => setShowCitySelector(false)}
                  >
                     <View style={styles.modalOverlay}>
                        <Selector<Ciudad>
                           onAccept={(ciudad) => {
                              onChange(ciudad);
                              setShowCitySelector(false);
                           }}
                           onCancel={() => setShowCitySelector(false)}
                           fetchUrl={`${ports.api}/ciudad`}
                           keyExtractor={(item) => item.CodCiudad.toString()}
                           labelExtractor={(item) => item.Nombre}
                           headerTitle="Ciudades disponibles"
                           headerSubtitle="Elige la ciudad"
                           initialEntity={initial}
                        />
                     </View>
                  </Modal>
               </>
            )}
         />
      </View>
   );
}

interface SelectorFieldProps<T extends FieldValues> {
   label: string;
   name: Path<T>;
   control: Control<T>;
   rules?: Omit<
      RegisterOptions<T>,
      "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
   >;
   errors: FieldErrors<T>;
   initial?: Equipo | null;
}

export function EquipoSelectorField<T extends FieldValues>({
   label,
   name,
   control,
   rules,
   errors,
   initial,
}: SelectorFieldProps<T>) {
   const [showSelector, setShowSelector] = useState(false);

   return (
      <View style={styles.fieldContainer}>
         <Text style={styles.fieldLabel}>{label}</Text>
         <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value } }) => (
               <>
                  <TouchableOpacity
                     onPress={() => setShowSelector(true)}
                     style={[
                        styles.datePickerButton,
                        {
                           borderColor: errors[name]
                              ? colors.red.red500
                              : colors.blue.blue600,
                        },
                     ]}
                  >
                     <Text
                        style={[
                           styles.datePickerText,
                           {
                              color: value
                                 ? colors.blue.blue900
                                 : colors.gray.gray500,
                           },
                        ]}
                     >
                        {value ? value.Nombre : "Selecciona el equipo"}
                     </Text>
                  </TouchableOpacity>
                  {errors[name] && (
                     <Text style={styles.errorText}>
                        {errors[name].message?.toString()}
                     </Text>
                  )}
                  <Modal
                     visible={showSelector}
                     transparent={true}
                     animationType="slide"
                     onRequestClose={() => setShowSelector(false)}
                  >
                     <View style={styles.modalOverlay}>
                        <Selector<Equipo>
                           onAccept={(equipo) => {
                              onChange(equipo);
                              setShowSelector(false);
                           }}
                           onCancel={() => setShowSelector(false)}
                           fetchUrl={`${ports.api}/equipo`}
                           keyExtractor={(item) => item.CodEquipo.toString()}
                           labelExtractor={(item) => item.Nombre}
                           headerTitle="Equipos disponibles"
                           headerSubtitle="Elige el equipo"
                           initialEntity={initial}
                        />
                     </View>
                  </Modal>
               </>
            )}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: spacings.s2,
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
