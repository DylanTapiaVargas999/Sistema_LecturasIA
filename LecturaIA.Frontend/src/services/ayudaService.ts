import api from '../config/api';
import type { EstadoTutorial } from '../types/user.types';

export type { EstadoTutorial };

export const ayudaService = {
  async obtenerEstadoTutorial(): Promise<EstadoTutorial> {
    const response = await api.get('/Ayuda/estado-tutorial');
    return response.data;
  },

  async marcarTutorialVisto(): Promise<void> {
    await api.post('/Ayuda/marcar-tutorial-visto', {});
  }
};
