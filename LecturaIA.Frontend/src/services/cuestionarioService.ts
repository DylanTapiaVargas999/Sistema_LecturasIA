// En producción con Nginx proxy, usa rutas relativas
// En desarrollo, usa localhost
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5267' : '');
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api';

export interface PreguntaDto {
  id: string;
  orden: number;
  tipo: string; // "Literal", "Analitica", "Critica"
  formato: string; // "OpcionMultiple", "Abierta"
  textoPregunta: string;
  opciones?: string[]; // Solo para opción múltiple
}

export interface CuestionarioDto {
  id: string;
  sesionLecturaId: string;
  lecturaId: number;
  fechaGeneracion: string;
  estado: string; // "generando", "listo", "enviado", "evaluado"
  nivelDificultad: string;
  tipoTexto: string;
  tituloLectura: string;
  preguntas: PreguntaDto[];
}

export interface RespuestaDto {
  preguntaId: string;
  textoRespuesta: string;
}

export interface EnviarRespuestasDto {
  respuestas: RespuestaDto[];
  tiempoCuestionarioMinutos: number;
}

export interface RetroalimentacionDto {
  logros: string;
  mejora: string;
  consejos: string;
  animo: string;
}

export interface ResultadoDto {
  id: string;
  cuestionarioId: string;
  fechaEvaluacion: string;
  tiempoLecturaMinutos: number;
  tiempoCuestionarioMinutos: number;
  puntajeTotal: number;
  porcentaje: number;
  correctasLiterales: number;
  correctasAnaliticas: number;
  puntajeCriticas: number;
  retroalimentacionPersonalizada: string;
  retroalimentacion?: RetroalimentacionDto; // Nueva estructura
  mensajeAnimo: string;
  nivelAnterior: string;
  nivelNuevo: string;
  accionNivel: string; // "subir", "mantener", "bajar", "maximo", "minimo"
  mensajeAdaptacion: string;
  detalleRespuestas?: PreguntaRevisionDto[]; // Respuestas detalladas (solo en /respuestas)
}

export interface PreguntaRevisionDto {
  preguntaId: string;
  orden: number;
  tipo: string;
  formato: string;
  textoPregunta: string;
  opciones?: string[];
  respuestaCorrecta?: string;
  explicacion?: string;
  respuestaEstudiante?: string;
  esCorrecta?: boolean;
  puntajeIA?: number;
  retroalimentacionIA?: string;
  textoRespuestaAbierta?: string;
}

// ResultadoCuestionarioDto ya incluye todo lo necesario
// (puntajes, retroalimentación, y detalleRespuestas)
export type CuestionarioRevisionDto = ResultadoDto;

export const cuestionarioService = {
  // Generar cuestionario
  async generarCuestionario(sesionLecturaId: string): Promise<CuestionarioDto> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Cuestionarios/generar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sesionLecturaId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al generar cuestionario');
    }

    return await response.json();
  },

  // Obtener cuestionario (polling para ver si está listo)
  async obtenerCuestionario(cuestionarioId: string): Promise<CuestionarioDto> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Cuestionarios/${cuestionarioId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener cuestionario');
    }

    return await response.json();
  },

  // Enviar respuestas del cuestionario
  async enviarRespuestas(cuestionarioId: string, respuestas: RespuestaDto[], tiempoCuestionarioMinutos: number): Promise<ResultadoDto> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Cuestionarios/${cuestionarioId}/enviar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        respuestas,
        tiempoCuestionarioMinutos 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al enviar respuestas');
    }

    return await response.json();
  },

  // Obtener respuestas con correcciones para revisión
  async obtenerRevision(cuestionarioId: string): Promise<CuestionarioRevisionDto> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Cuestionarios/${cuestionarioId}/respuestas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener revisión');
    }

    return await response.json();
  },

  // Obtener resultado de un cuestionario evaluado
  async obtenerResultado(cuestionarioId: string): Promise<ResultadoDto> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Cuestionarios/${cuestionarioId}/resultado`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener resultado');
    }

    return await response.json();
  },

  // Obtener historial de resultados de una lectura
  async obtenerHistorialLectura(lecturaId: number): Promise<ResultadoDto[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Cuestionarios/lectura/${lecturaId}/historial`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener historial');
    }

    return await response.json();
  }
};

export type { CuestionarioDto as Cuestionario };
