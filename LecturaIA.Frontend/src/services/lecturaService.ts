import type { PreferenciasLectura } from '../components/EncuestaGuiadaModal';

// En producción con Nginx proxy, usa rutas relativas
// En desarrollo, usa localhost
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5267' : '');
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api';

// Helper para construir URL completa de imagen
export const getImageUrl = (relativePath?: string): string => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  // En producción con proxy, las imágenes se sirven desde el mismo dominio
  if (BASE_URL) {
    return `${BASE_URL}${relativePath}`;
  }
  // Ruta relativa para producción con Nginx proxy
  return relativePath;
};

interface LecturaGenerada {
  id: number;
  titulo: string;
  contenido: string;
  urlImagen?: string;
  tipoLectura: string;
  preferencias: PreferenciasLectura;
  fechaCreacion: string;
}

interface LecturaLista {
  id: number;
  titulo: string;
  tipoLectura: string;
  longitud: string;
  fechaCreacion: string;
  progreso: number;
  estado: string;
  esFavorita: boolean;
  tieneCuestionario: boolean;
  cuestionarioId?: string;
  cuestionarioEvaluado: boolean;
}

export const lecturaService = {
  // Generar nueva lectura con IA
  async generarLectura(preferencias: PreferenciasLectura): Promise<LecturaGenerada> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Lecturas/generar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        preferencias: {
          temas: preferencias.temas,
          personajes: preferencias.personajes,
          escenario: preferencias.escenario,
          longitud: preferencias.longitud,
          emocion: preferencias.emocion,
          proposito: preferencias.proposito
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al generar la lectura');
    }

    return await response.json();
  },

  // Obtener todas las lecturas del estudiante
  async obtenerLecturas(): Promise<LecturaLista[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Lecturas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener las lecturas');
    }

    return await response.json();
  },

  // Obtener una lectura específica
  async obtenerLectura(id: number): Promise<LecturaGenerada> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Lecturas/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener la lectura');
    }

    return await response.json();
  },

  // Eliminar una lectura
  async eliminarLectura(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    console.log('Eliminando lectura, URL:', `${API_URL}/Lecturas/${id}`);
    
    const response = await fetch(`${API_URL}/Lecturas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Respuesta DELETE:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'Error al eliminar la lectura';
      try {
        const error = await response.json();
        console.error('Error del servidor:', error);
        errorMessage = error.mensaje || error.message || errorMessage;
      } catch (e) {
        // Si no puede parsear JSON, usar el statusText
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Lectura eliminada exitosamente');
  },

  // Marcar/desmarcar como favorita
  async toggleFavorita(lecturaId: number, esFavorita: boolean): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Lecturas/${lecturaId}/favorita`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ esFavorita })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al actualizar favorita');
    }
  },

  // Obtener solo lecturas favoritas
  async obtenerFavoritas(): Promise<LecturaLista[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/Lecturas/favoritas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener favoritas');
    }

    return await response.json();
  }
};

export type { LecturaGenerada, LecturaLista };
