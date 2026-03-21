import api from '../config/api';
import type { PerfilUsuarioDto, ActualizarPerfilDto } from '../types/user.types';

/**
 * Servicio para gestión del perfil del usuario autenticado.
 */
export const perfilService = {
  /**
   * Obtiene los datos del perfil actual.
   * @returns Datos del usuario.
   */
  async obtenerPerfil(): Promise<PerfilUsuarioDto> {
    const response = await api.get('/perfil');
    return response.data;
  },

  /**
   * Actualiza datos básicos del perfil (nombre, avatar, preferencias).
   * @param data Campos a actualizar.
   * @returns Perfil actualizado.
   */
  async actualizarPerfil(data: ActualizarPerfilDto): Promise<PerfilUsuarioDto> {
    const response = await api.put('/perfil', data);
    return response.data;
  },

  /**
   * Sube una nueva imagen de avatar.
   * @param file Archivo de imagen.
   * @returns URL del nuevo avatar.
   */
  async subirAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/perfil/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
