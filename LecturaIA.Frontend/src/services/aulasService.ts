import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267';
const API_URL = `${BASE_URL}/api`;

// ===== TIPOS =====

export interface AulaDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  codigoVinculacion: string;
  nombreDocente: string;
  cantidadEstudiantes: number;
  fechaCreacion: string;
}

export interface EstudianteAula {
  estudianteId: number;
  nombreCompleto: string;
  email: string;
  grado?: string;
  fechaVinculacion: string;
  tareasDiarias: number;
}

export interface CrearAulaDto {
  nombre: string;
  descripcion?: string;
}

// ===== FUNCIONES PARA DOCENTES =====

/**
 * Obtiene todas las aulas del docente autenticado
 */
export async function obtenerMisAulas(): Promise<AulaDetalle[]> {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/Aulas/mis-aulas`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
 * Obtiene los detalles de un aula
 */
export async function obtenerAula(id: number): Promise<AulaDetalle> {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/Aulas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

/**
 * Obtiene los estudiantes de un aula (Docente)
 */
export async function obtenerEstudiantesAula(aulaId: number): Promise<EstudianteAula[]> {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/Aulas/${aulaId}/estudiantes`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

/**
 * Elimina un aula (Docente)
 */
export async function eliminarAula(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/Aulas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Remueve un estudiante de un aula (Docente)
 */
export async function removerEstudiante(aulaId: number, estudianteId: number): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/Aulas/${aulaId}/estudiante/${estudianteId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const aulasService = {
  obtenerMisAulas,
  crearAula,
  obtenerAula,
  obtenerEstudiantesAula,
  eliminarAula,
  removerEstudiante
};
