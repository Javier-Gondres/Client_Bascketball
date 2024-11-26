export interface Jugador {
   CodJugador: string;
   Nombre1: string;
   Nombre2: string | null;
   Apellido1: string;
   Apellido2: string | null;
   CiudadNacim: string | null;
   FechaNacim: Date;
   Numero: string;
   CodEquipo: string | null;
   ciudad: Ciudad | null;
   equipo: Equipo | null;
   estadisticasDeJuego: EstadisticaJuego[];
}

export interface Juego {
   CodJuego: string;
   Descripcion: string;
   Equipo1: string;
   Equipo2: string;
   Fecha: Date;
   Equipo1Entity: Equipo;
   Equipo2Entity: Equipo;
   estadisticasDeJuego?: EstadisticaJuego[];
}

export interface EstadisticaJuego {
   CodEstadistica: string;
   CodJuego: string;
   CodJugador: string;
   Cantidad: number;
   jugador?: Jugador;
   juego?: Juego;
   estadistica?: Estadistica;
}

export interface Estadistica {
   CodEstadistica: string;
   Descripcion: string;
   Valor: number;
   estadisticasDeJuego?: EstadisticaJuego[];
}

export interface Equipo {
   CodEquipo: string;
   Nombre: string;
   CodCiudad: string | null;
   ciudad: Ciudad | null;
   jugadores?: Jugador[];
   juegosEquipo1?: Juego[];
   juegosEquipo2?: Juego[];
}

export interface Ciudad {
   CodCiudad: string;
   Nombre: string;
   equipos?: Equipo[];
   jugadores?: Jugador[];
}
