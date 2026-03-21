import api from '../config/api';
import type { 
  CrearExamenGrupalDto, 
  ExamenGrupalDto, 
  AsignacionExamenDto, 
  ResultadoEstudianteDto, 
  EstadisticasExamenDto, 
  ResultadosExamenGrupalDto 
} from '../types/exam.types';

// ============================================
// EXPORTACIONES DE TIPOS
// ============================================

export type {
  CrearExamenGrupalDto,
  ExamenGrupalDto,
  AsignacionExamenDto,
  ResultadoEstudianteDto,
  EstadisticasExamenDto,
  ResultadosExamenGrupalDto,
};

// ============================================
// SERVICIO PRINCIPAL
// ============================================

const examenGrupalService = {
  /**
   * Crea un examen grupal con generación de IA
   * @param dto Datos del examen a crear
   * @returns Examen creado con estadísticas
   */
  crearExamenConIA: async (dto: CrearExamenGrupalDto): Promise<{ mensaje: string; examen: ExamenGrupalDto }> => {
    const response = await api.post('/examengrupales/crear', dto);
    return response.data;
  },

  /**
   * Obtiene todos los exámenes de un salón (vista del docente)
   * @param aulaId ID del aula
   * @returns Lista de exámenes con estadísticas
   */
  obtenerExamenesDelSalon: async (aulaId: number): Promise<ExamenGrupalDto[]> => {
    const response = await api.get(`/examengrupales/salon/${aulaId}`);
    return response.data;
  },

  /**
   * Obtiene los exámenes asignados al estudiante actual
   * @returns Lista de exámenes asignados
   */
  obtenerExamenesAsignados: async (): Promise<AsignacionExamenDto[]> => {
    const response = await api.get('/examengrupales/asignados');
    return response.data;
  },

  /**
   * Obtiene los resultados consolidados de un examen grupal
   * @param examenGrupalId ID del examen grupal
   * @returns Resultados con estadísticas detalladas
   */
  obtenerResultadosConsolidados: async (examenGrupalId: number): Promise<ResultadosExamenGrupalDto> => {
    const response = await api.get(`/examengrupales/${examenGrupalId}/resultados`);
    return response.data;
  },

  /**
   * Marca una asignación como completada
   * @param examenGrupalId ID del examen grupal
   * @param sesionLecturaId ID de la sesión de lectura
   * @returns Mensaje de confirmación
   */
  marcarComoCompletado: async (examenGrupalId: number, sesionLecturaId: string): Promise<{ mensaje: string }> => {
    const response = await api.post(`/examengrupales/${examenGrupalId}/completar`, { sesionLecturaId });
    return response.data;
  },

  /**
   * Elimina un examen grupal (solo si no hay estudiantes que lo completaron)
   * @param examenGrupalId ID del examen grupal
   * @returns Mensaje de confirmación
   */
  eliminarExamen: async (examenGrupalId: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/examengrupales/${examenGrupalId}`);
    return response.data;
  },

  /**
   * Lista todos los exámenes de un aula (para docente)
   * @param aulaId ID del aula
   * @returns Lista de exámenes del aula
   */
  listarExamenesAula: async (aulaId: number): Promise<ExamenGrupalDto[]> => {
    const response = await api.get(`/examengrupales/docente/aula/${aulaId}`);
    return response.data;
  },

  /**
   * Reasigna un examen existente a todos los estudiantes del aula
   * @param examenId ID del examen a reasignar
   * @param dto Datos de reasignación (fecha límite opcional)
   * @returns Mensaje de confirmación y conteo
   */
  reasignarExamen: async (examenId: number, dto: { fechaLimite?: string }): Promise<{ mensaje: string; asignacionesCreadas: number }> => {
    const response = await api.post(`/examengrupales/${examenId}/reasignar`, dto);
    return response.data;
  },
};

export default examenGrupalService;
