import api, { API_URL } from '../config/api';
import type { LecturaGenerada, LecturaLista, PreferenciasLectura } from '../types/reading.types';

export type { LecturaGenerada, LecturaLista, PreferenciasLectura };

// Helper para construir URL completa de imagen
export const getImageUrl = (relativePath?: string): string => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  
  // Si API_URL está definido, lo usamos como base
  if (API_URL) {
    // Si la imagen empieza con /, nos aseguramos que no haya doble slash
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${API_URL}${cleanPath}`;
  }
  
  return relativePath;
};

// ==================== SERVICIO DE LECTURAS ====================

export const lecturaService = {
  // Generar nueva lectura con IA
  async generarLectura(preferencias: PreferenciasLectura): Promise<LecturaGenerada> {
    const response = await api.post<LecturaGenerada>('/Lecturas/generar', {
      preferencias: {
        temas: preferencias.temas,
        personajes: preferencias.personajes,
        escenario: preferencias.escenario,
        longitud: preferencias.longitud,
        emocion: preferencias.emocion,
        proposito: preferencias.proposito
      }
    });
    return response.data;
  },

  // Obtener todas las lecturas del estudiante
  async obtenerLecturas(): Promise<LecturaLista[]> {
    const response = await api.get<LecturaLista[]>('/Lecturas');
    return response.data;
  },

  // Obtener una lectura específica
  async obtenerLectura(id: number): Promise<LecturaGenerada> {
    const response = await api.get<LecturaGenerada>(`/Lecturas/${id}`);
    return response.data;
  },

  // Eliminar una lectura
  async eliminarLectura(id: number): Promise<void> {
    console.log('Eliminando lectura ID:', id);
    await api.delete(`/Lecturas/${id}`);
    console.log('Lectura eliminada exitosamente');
  },

  // Marcar/desmarcar como favorita
  async toggleFavorita(lecturaId: number, esFavorita: boolean): Promise<void> {
    await api.put(`/Lecturas/${lecturaId}/favorita`, { esFavorita });
  },

  // Obtener solo lecturas favoritas
  async obtenerFavoritas(): Promise<LecturaLista[]> {
    const response = await api.get<LecturaLista[]>('/Lecturas/favoritas');
    return response.data;
  }
};

