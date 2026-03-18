// Servicio para gestionar sesiones de lectura (CU-005)
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5267' : '');
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api';

interface SesionLectura {
  id: string;
  lecturaId: number;
  fechaInicio: string;
  completada: boolean;
}

interface LecturaFinalizada {
  sesionLecturaId: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  tiempoLecturaMinutos: number;
  mensaje: string;
}

export const sesionLecturaService = {
  // CU-005: Iniciar sesión de lectura
  async iniciarLectura(lecturaId: number): Promise<SesionLectura> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/SesionesLectura/iniciar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ lecturaId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar la lectura');
    }

    return await response.json();
  },

  // CU-005: Finalizar sesión de lectura
  async finalizarLectura(sesionLecturaId: string, tiempoLecturaMinutos: number): Promise<LecturaFinalizada> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/SesionesLectura/finalizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sesionLecturaId, tiempoLecturaMinutos })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al finalizar la lectura');
    }

    return await response.json();
  },

  // Obtener sesión activa de una lectura
  async obtenerSesionActiva(lecturaId: number): Promise<SesionLectura | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/SesionesLectura/activa/${lecturaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 404) {
      return null; // No hay sesión activa
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener la sesión');
    }

    return await response.json();
  }
};

export type { SesionLectura, LecturaFinalizada };
