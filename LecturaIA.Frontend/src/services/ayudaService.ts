import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267';
const API_URL = `${BASE_URL}/api`;

export interface EstadoTutorial {
  primeraSesion: boolean;
}

export const ayudaService = {
  async obtenerEstadoTutorial(): Promise<EstadoTutorial> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/Ayuda/estado-tutorial`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async marcarTutorialVisto(): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/Ayuda/marcar-tutorial-visto`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
