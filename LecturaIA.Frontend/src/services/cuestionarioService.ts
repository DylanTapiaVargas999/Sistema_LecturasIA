import api from '../config/api';
import type { 
  PreguntaDto, 
  CuestionarioDto, 
  RespuestaDto, 
  EnviarRespuestasDto, 
  RetroalimentacionDto, 
  ResultadoDto, 
  PreguntaRevisionDto 
} from '../types/reading.types';

export type { 
  PreguntaDto, 
  CuestionarioDto, 
  RespuestaDto, 
  EnviarRespuestasDto, 
  RetroalimentacionDto, 
  ResultadoDto, 
  PreguntaRevisionDto 
};

// ResultadoCuestionarioDto ya incluye todo lo necesario
export type CuestionarioRevisionDto = ResultadoDto;

export const cuestionarioService = {
  // Generar cuestionario
  async generarCuestionario(sesionLecturaId: string): Promise<CuestionarioDto> {
    const response = await api.post<CuestionarioDto>('/Cuestionarios/generar', { sesionLecturaId });
    return response.data;
  },

  // Obtener cuestionario (polling para ver si está listo)
  async obtenerCuestionario(cuestionarioId: string): Promise<CuestionarioDto> {
    const response = await api.get<CuestionarioDto>(`/Cuestionarios/${cuestionarioId}`);
    return response.data;
  },

  // Enviar respuestas del cuestionario
  async enviarRespuestas(cuestionarioId: string, respuestas: RespuestaDto[], tiempoCuestionarioMinutos: number): Promise<ResultadoDto> {
    const response = await api.post<ResultadoDto>(`/Cuestionarios/${cuestionarioId}/enviar`, { 
      respuestas,
      tiempoCuestionarioMinutos 
    });
    return response.data;
  },

  // Obtener respuestas con correcciones para revisión
  async obtenerRevision(cuestionarioId: string): Promise<CuestionarioRevisionDto> {
    const response = await api.get<CuestionarioRevisionDto>(`/Cuestionarios/${cuestionarioId}/respuestas`);
    return response.data;
  },

  // Obtener resultado de un cuestionario evaluado
  async obtenerResultado(cuestionarioId: string): Promise<ResultadoDto> {
    const response = await api.get<ResultadoDto>(`/Cuestionarios/${cuestionarioId}/resultado`);
    return response.data;
  },

  // Obtener historial de resultados de una lectura
  async obtenerHistorialLectura(lecturaId: number): Promise<ResultadoDto[]> {
    const response = await api.get<ResultadoDto[]>(`/Cuestionarios/lectura/${lecturaId}/historial`);
    return response.data;
  }
};

export default cuestionarioService;
export type { CuestionarioDto as Cuestionario };
