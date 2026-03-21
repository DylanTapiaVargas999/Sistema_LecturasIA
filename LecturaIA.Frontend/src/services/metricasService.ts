import api from '../config/api';
import type { 
  MetricasEstudiante, 
  MetricasAula 
} from '../types/metrics.types';

export type { MetricasEstudiante, MetricasAula };

class MetricasService {
  async obtenerMetricasEstudiante(estudianteId: number): Promise<MetricasEstudiante> {
    const response = await api.get<MetricasEstudiante>(`/Metricas/estudiante/${estudianteId}`);
    return response.data;
  }

  async obtenerMetricasAula(aulaId: number): Promise<MetricasAula> {
    const response = await api.get<MetricasAula>(`/Metricas/aula/${aulaId}`);
    return response.data;
  }
}

export const metricasService = new MetricasService();
