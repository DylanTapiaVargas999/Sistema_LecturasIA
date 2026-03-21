import api from '../config/api';
import type { SesionLectura, LecturaFinalizada } from '../types/reading.types';

export type { SesionLectura, LecturaFinalizada };

export const sesionLecturaService = {
  // CU-005: Iniciar sesión de lectura
  async iniciarLectura(lecturaId: number): Promise<SesionLectura> {
    const response = await api.post<SesionLectura>('/SesionesLectura/iniciar', { lecturaId });
    return response.data;
  },

  // CU-005: Finalizar sesión de lectura
  async finalizarLectura(sesionLecturaId: string, tiempoLecturaMinutos: number): Promise<LecturaFinalizada> {
    const response = await api.post<LecturaFinalizada>('/SesionesLectura/finalizar', {
      sesionLecturaId,
      tiempoLecturaMinutos
    });
    return response.data;
  },

  // Obtener sesión activa de una lectura
  async obtenerSesionActiva(lecturaId: number): Promise<SesionLectura | null> {
    try {
      const response = await api.get<SesionLectura>(`/SesionesLectura/activa/${lecturaId}`);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }
};

