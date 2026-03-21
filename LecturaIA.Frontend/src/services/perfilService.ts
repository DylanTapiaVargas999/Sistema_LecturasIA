import api from '../config/api';
import type { PerfilUsuario } from '../types/user.types';
import type { AulaInfo, AulaDetalle, CrearAulaDto, UnirseAClaseDto } from '../types/classroom.types';

export type { PerfilUsuario, AulaInfo, AulaDetalle, CrearAulaDto, UnirseAClaseDto };

// ===== FUNCIONES =====

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function obtenerPerfil(): Promise<PerfilUsuario> {
  const response = await api.get('/Perfil');
  return response.data;
}

/**
 * Crear un aula nueva (Docente)
 */
export async function crearAula(dto: CrearAulaDto): Promise<AulaDetalle> {
  const response = await api.post('/Aulas/crear', dto);
  return response.data;
}

/**
 * Unirse a una clase con código (Estudiante)
 */
export async function unirseAClase(codigoVinculacion: string): Promise<AulaDetalle> {
  const response = await api.post('/Aulas/unirse', { codigoVinculacion });
  return response.data;
}

/**
 * Obtener mi clase actual (Estudiante)
 */
export async function obtenerMiClase(): Promise<AulaDetalle | null> {
  try {
    const response = await api.get('/Aulas/mi-clase');
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
  await api.post('/Aulas/salir', {});
}

export const perfilService = {
  obtenerPerfil,
  crearAula,
  unirseAClase,
  obtenerMiClase,
  salirDeClase
};
