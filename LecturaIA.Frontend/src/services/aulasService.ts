import api from '../config/api';
import type { AulaDetalle, EstudianteAula, CrearAulaDto } from '../types/classroom.types';

export type { AulaDetalle, EstudianteAula, CrearAulaDto };

// ===== FUNCIONES PARA DOCENTES =====

/**
 * Obtiene todas las aulas del docente autenticado
 */
export async function obtenerMisAulas(): Promise<AulaDetalle[]> {
  const response = await api.get<AulaDetalle[]>('/Aulas/mis-aulas');
  return response.data;
}

/**
 * Crear un aula nueva (Docente)
 */
export async function crearAula(dto: CrearAulaDto): Promise<AulaDetalle> {
  const response = await api.post<AulaDetalle>('/Aulas/crear', dto);
  return response.data;
}

/**
 * Obtiene los detalles de un aula
 */
export async function obtenerAula(id: number): Promise<AulaDetalle> {
  const response = await api.get<AulaDetalle>(`/Aulas/${id}`);
  return response.data;
}

/**
 * Obtiene los estudiantes de un aula (Docente)
 */
export async function obtenerEstudiantesAula(aulaId: number): Promise<EstudianteAula[]> {
  const response = await api.get<EstudianteAula[]>(`/Aulas/${aulaId}/estudiantes`);
  return response.data;
}

/**
 * Elimina un aula (Docente)
 */
export async function eliminarAula(id: number): Promise<void> {
  await api.delete(`/Aulas/${id}`);
}

/**
 * Remueve un estudiante de un aula (Docente)
 */
export async function removerEstudiante(aulaId: number, estudianteId: number): Promise<void> {
  await api.delete(`/Aulas/${aulaId}/estudiante/${estudianteId}`);
}

export const aulasService = {
  obtenerMisAulas,
  crearAula,
  obtenerAula,
  obtenerEstudiantesAula,
  eliminarAula,
  removerEstudiante
};
