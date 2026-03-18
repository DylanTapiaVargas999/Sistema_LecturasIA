import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ============================================
// INTERFACES / TIPOS
// ============================================

interface CrearExamenGrupalDto {
  aulaId: number;
  titulo: string;
  descripcion?: string;
  temaConcepto: string;
  tipoTexto: string;
  longitudTexto: string;
  gradoEscolar: string;
  complejidad: string;
  cantidadPreguntas: number;
  fechaLimite?: string;
  publicado: boolean;
}

interface ExamenGrupalDto {
  id: number;
  aulaId: number;
  nombreAula: string;
  titulo: string;
  descripcion?: string;
  longitudTexto: string;
  gradoEscolar: string;
  complejidad: string;
  fechaCreacion: string;
  fechaLimite?: string;
  publicado: boolean;
  lecturaId: number;
  tituloLectura: string;
  tipoLectura: string;
  cantidadPreguntas: number;
  totalEstudiantes: number;
  estudiantesCompletados: number;
  porcentajeCompletado: number;
  promedioGrupal?: number;
  tiempoPromedioMinutos?: number;
}

interface AsignacionExamenDto {
  id: number;
  examenGrupalId: number;
  tituloExamen: string;
  descripcionExamen?: string;
  nombreDocente: string;
  estado: string;
  fechaAsignacion: string;
  fechaLimite?: string;
  fechaCompletado?: string;
  calificacion?: number;
  lecturaId: number;
  tituloLectura: string;
  longitudTexto: string;
  cantidadPreguntas: number;
}

interface ResultadoEstudianteDto {
  estudianteId: number;
  nombreCompleto: string;
  estado: string;
  fechaCompletado?: string;
  calificacion?: number;
  tiempoTotalMinutos?: number;
  tiempoLecturaMinutos?: number;
  tiempoQuizMinutos?: number;
}

interface EstadisticasExamenDto {
  totalEstudiantes: number;
  completados: number;
  pendientes: number;
  porcentajeCompletado: number;
  promedioGrupal?: number;
  calificacionMaxima?: number;
  calificacionMinima?: number;
  tiempoPromedioMinutos?: number;
  estudiantesPendientes: string[];
  estudiantesConDificultad: string[];
  estudiantesDestacados: string[];
}

interface ResultadosExamenGrupalDto {
  examenInfo: ExamenGrupalDto;
  resultados: ResultadoEstudianteDto[];
  estadisticas: EstadisticasExamenDto;
}

const examenGrupalService = {
  /**
   * Crea un examen grupal con generación de IA
   * @param dto Datos del examen a crear
   * @returns Examen creado con estadísticas
   */
  crearExamenConIA: async (dto: CrearExamenGrupalDto): Promise<{ mensaje: string; examen: ExamenGrupalDto }> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/examengrupales/crear`, dto, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Obtiene todos los exámenes de un salón (vista del docente)
   * @param aulaId ID del aula
   * @returns Lista de exámenes con estadísticas
   */
  obtenerExamenesDelSalon: async (aulaId: number): Promise<ExamenGrupalDto[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/examengrupales/salon/${aulaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Obtiene los exámenes asignados al estudiante actual
   * @returns Lista de exámenes asignados
   */
  obtenerExamenesAsignados: async (): Promise<AsignacionExamenDto[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/examengrupales/asignados`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Obtiene los resultados consolidados de un examen grupal
   * @param examenGrupalId ID del examen grupal
   * @returns Resultados con estadísticas detalladas
   */
  obtenerResultadosConsolidados: async (examenGrupalId: number): Promise<ResultadosExamenGrupalDto> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/examengrupales/${examenGrupalId}/resultados`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Marca una asignación como completada
   * @param examenGrupalId ID del examen grupal
   * @param sesionLecturaId ID de la sesión de lectura
   * @returns Mensaje de confirmación
   */
  marcarComoCompletado: async (examenGrupalId: number, sesionLecturaId: string): Promise<{ mensaje: string }> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/api/examengrupales/${examenGrupalId}/completar`,
      { sesionLecturaId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Elimina un examen grupal (solo si no hay estudiantes que lo completaron)
   * @param examenGrupalId ID del examen grupal
   * @returns Mensaje de confirmación
   */
  eliminarExamen: async (examenGrupalId: number): Promise<{ mensaje: string }> => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/examengrupales/${examenGrupalId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Lista todos los exámenes de un aula (para docente)
   * @param aulaId ID del aula
   * @returns Lista de exámenes del aula
   */
  listarExamenesAula: async (aulaId: number): Promise<any[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/examengrupales/docente/aula/${aulaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Reasigna un examen existente a todos los estudiantes del aula
   * @param examenId ID del examen a reasignar
   * @param dto Datos de reasignación (fecha límite opcional)
   * @returns Mensaje de confirmación
   */
  reasignarExamen: async (examenId: number, dto: { fechaLimite?: string }): Promise<{ mensaje: string; asignacionesCreadas: number }> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/api/examengrupales/${examenId}/reasignar`,
      dto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },
};

// ============================================
// EXPORTACIONES
// ============================================

export type {
  CrearExamenGrupalDto,
  ExamenGrupalDto,
  AsignacionExamenDto,
  ResultadoEstudianteDto,
  EstadisticasExamenDto,
  ResultadosExamenGrupalDto,
};

export default examenGrupalService;
