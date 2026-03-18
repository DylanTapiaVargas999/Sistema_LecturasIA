import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267';
const API_URL = `${BASE_URL}/api`;

// ===== TIPOS =====

export interface PerfilUsuario {
  nombreCompleto: string;
  email: string;
  tipoUsuario: string;
  grado?: string;
  edad?: number;
  nivelEducativo?: string;
  intereses?: string;
  nivelDificultad?: string;
  claseActual?: AulaInfo | null;
}

export interface AulaInfo {
  id: number;
  nombre: string;
  descripcion?: string;
  nombreDocente: string;
  fechaVinculacion: string;
}

export interface AulaDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  codigoVinculacion: string;
  nombreDocente: string;
  cantidadEstudiantes: number;
  fechaCreacion: string;
}

export interface CrearAulaDto {
  nombre: string;
  descripcion?: string;
}

export interface UnirseAClaseDto {
  codigoVinculacion: string;
}

// ===== FUNCIONES =====

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function obtenerPerfil(): Promise<PerfilUsuario> {
  const token = localStorage.getItem('token');
  console.log('🔑 Token:', token ? 'Presente' : 'No encontrado');
  console.log('🌐 API URL:', `${API_URL}/Perfil`);
  
  const response = await axios.get(`${API_URL}/Perfil`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  console.log('📦 Respuesta del servidor:', response.data);
  return response.data;
}

/**
 * Crear un aula nueva (Docente)
 */
export async function crearAula(dto: CrearAulaDto): Promise<AulaDetalle> {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/Aulas/crear`, dto, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

/**
 * Unirse a una clase con código (Estudiante)
 */
export async function unirseAClase(codigoVinculacion: string): Promise<AulaDetalle> {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/Aulas/unirse`,
    { codigoVinculacion },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

/**
 * Obtener mi clase actual (Estudiante)
 */
export async function obtenerMiClase(): Promise<AulaDetalle | null> {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/Aulas/mi-clase`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.clase || response.data;
  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.data?.mensaje?.includes('No estás vinculado')) {
      return null;
    }
    throw error;
  }
}

/**
 * Salir de la clase actual (Estudiante)
 */
export async function salirDeClase(): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.post(`${API_URL}/Aulas/salir`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const perfilService = {
  obtenerPerfil,
  crearAula,
  unirseAClase,
  obtenerMiClase,
  salirDeClase
};
