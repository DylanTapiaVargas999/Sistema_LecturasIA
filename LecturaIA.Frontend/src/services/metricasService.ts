import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267';
const API_URL = `${BASE_URL}/api`;

export interface PuntoEvolucion {
  numeroQuiz: number;
  calificacion: number;
  fecha: string;
  tituloLectura: string;
}

export interface AnalisisHabilidad {
  porcentajeLiteral: number;
  porcentajeInferencial: number;
  porcentajeCritico: number;
}

export interface MetricasEstudiante {
  lecturasCompletadas: number;
  promedioQuiz: number;
  nivelActual: string;
  tipoTextoFavorito: string;
  ultimaActividad: string | null;
  tiempoPromedioLectura: number;
  evolucionTemporal: PuntoEvolucion[];
  analisisHabilidad: AnalisisHabilidad;
}

export interface ProgresoSemanal {
  numeroSemana: number;
  fechaInicio: string;
  fechaFin: string;
  promedioSemana: number;
  cantidadQuizzes: number;
}

export interface DistribucionTiposTexto {
  cantidadNarrativo: number;
  cantidadDescriptivo: number;
  cantidadExpositivo: number;
  cantidadArgumentativo: number;
  cantidadInstructivo: number;
  promedioNarrativo: number;
  promedioDescriptivo: number;
  promedioExpositivo: number;
  promedioArgumentativo: number;
  promedioInstructivo: number;
}

export interface MetricasAula {
  aulaId: number;
  nombreAula: string;
  totalEstudiantes: number;
  promedioClase: number;
  tiempoPromedioLectura: number;
  tiempoPromedioCuestionario: number;
  progresoSemanal: ProgresoSemanal[];
  distribucionTiposTexto: DistribucionTiposTexto;
}

class MetricasService {
  async obtenerMetricasEstudiante(estudianteId: number): Promise<MetricasEstudiante> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/Metricas/estudiante/${estudianteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async obtenerMetricasAula(aulaId: number): Promise<MetricasAula> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/Metricas/aula/${aulaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export const metricasService = new MetricasService();
