import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  tipo: string;
  estado: string;
  ultimoAcceso: string | null;
  suspendido: boolean;
  motivoSuspension: string | null;
  fechaSuspension: string | null;
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalSuspender, setModalSuspender] = useState<{ visible: boolean; usuario: Usuario | null }>({
    visible: false,
    usuario: null
  });
  const [modalReactivar, setModalReactivar] = useState<{ visible: boolean; usuario: Usuario | null }>({
    visible: false,
    usuario: null
  });
  const [modalReiniciarPassword, setModalReiniciarPassword] = useState<{ visible: boolean; usuario: Usuario | null }>({
    visible: false,
    usuario: null
  });
  const [modalMotivoSuspension, setModalMotivoSuspension] = useState<{ visible: boolean; usuarioId: number }>({
    visible: false,
    usuarioId: 0
  });
  const [motivoSuspension, setMotivoSuspension] = useState('');
  const [motivoReinicio, setMotivoReinicio] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  const confirmarSuspension = async () => {
    if (!modalSuspender.usuario) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/usuarios/suspender`,
        { usuarioId: modalSuspender.usuario.id, motivo: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalSuspender({ visible: false, usuario: null });
      setModalMotivoSuspension({ visible: true, usuarioId: modalSuspender.usuario.id });
    } catch (error) {
      console.error('Error al suspender usuario:', error);
      alert('Error al suspender usuario');
      setModalSuspender({ visible: false, usuario: null });
    }
  };

  const completarSuspension = async () => {
    if (!motivoSuspension.trim()) {
      alert('Debe ingresar un motivo para la suspensión');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/usuarios/suspender`,
        { usuarioId: modalMotivoSuspension.usuarioId, motivo: motivoSuspension },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalMotivoSuspension({ visible: false, usuarioId: 0 });
      setMotivoSuspension('');
      alert('Usuario suspendido correctamente.');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar motivo:', error);
      alert('Error al guardar motivo de suspensión');
    }
  };

  const confirmarReactivacion = async () => {
    if (!modalReactivar.usuario) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/usuarios/reactivar`,
        { usuarioId: modalReactivar.usuario.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalReactivar({ visible: false, usuario: null });
      alert('Usuario reactivado correctamente.');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al reactivar usuario:', error);
      alert('Error al reactivar usuario');
      setModalReactivar({ visible: false, usuario: null });
    }
  };

  const confirmarReinicioPassword = async () => {
    if (!modalReiniciarPassword.usuario) return;

    if (!motivoReinicio.trim()) {
      alert('Debe ingresar un motivo para el reinicio de contraseña');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/admin/usuarios/reiniciar-password`,
        { usuarioId: modalReiniciarPassword.usuario.id, motivo: motivoReinicio },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMotivoReinicio('');
      alert(response.data.mensaje);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al reiniciar contraseña:', error);
      alert('Error al reiniciar contraseña');
    } finally {
      setModalReiniciarPassword({ visible: false, usuario: null });
    }
  };

  if (cargando) {
    return <div className="text-center py-8">Cargando usuarios...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo Electrónico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nota
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {usuario.nombreCompleto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.tipo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.suspendido
                        ? 'bg-red-100 text-red-800'
                        : usuario.estado === 'Activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {usuario.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleString() : 'Nunca'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {usuario.tipo !== 'Administrador' && (
                    <>
                      {!usuario.suspendido ? (
                        <button
                          onClick={() => setModalSuspender({ visible: true, usuario })}
                          className="text-red-600 hover:text-red-900"
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          onClick={() => setModalReactivar({ visible: true, usuario })}
                          className="text-green-600 hover:text-green-900"
                        >
                          Reactivar
                        </button>
                      )}
                      <button
                        onClick={() => setModalReiniciarPassword({ visible: true, usuario })}
                        className="text-blue-600 hover:text-blue-900 ml-4"
                      >
                        Reiniciar Contraseña
                      </button>
                    </>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {usuario.motivoSuspension && (
                    <div className="max-w-xs">
                      <p className="text-xs font-semibold">Motivo suspensión:</p>
                      <p className="text-xs">{usuario.motivoSuspension}</p>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Confirmar Suspensión */}
      {modalSuspender.visible && modalSuspender.usuario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Suspensión</h3>
            <p className="mb-6">
              ¿Suspender a {modalSuspender.usuario.nombreCompleto}? El usuario no podrá acceder al sistema.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalSuspender({ visible: false, usuario: null })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSuspension}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Motivo Suspensión */}
      {modalMotivoSuspension.visible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Motivo de Suspensión</h3>
            <textarea
              value={motivoSuspension}
              onChange={(e) => setMotivoSuspension(e.target.value)}
              placeholder="Ingrese el motivo de la suspensión..."
              className="w-full p-3 border border-gray-300 rounded mb-4 h-32"
            />
            <div className="flex justify-end">
              <button
                onClick={completarSuspension}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Completar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reactivar Usuario */}
      {modalReactivar.visible && modalReactivar.usuario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Reactivación</h3>
            <p className="mb-6">
              ¿Desea reactivar a {modalReactivar.usuario.nombreCompleto}? El usuario podrá acceder nuevamente al
              sistema.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalReactivar({ visible: false, usuario: null })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReactivacion}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reiniciar Contraseña */}
      {modalReiniciarPassword.visible && modalReiniciarPassword.usuario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reiniciar Contraseña</h3>
            <p className="mb-4">
              ¿Desea generar una nueva contraseña temporal para{' '}
              {modalReiniciarPassword.usuario.nombreCompleto}?
            </p>
            <textarea
              value={motivoReinicio}
              onChange={(e) => setMotivoReinicio(e.target.value)}
              placeholder="Ingrese el motivo del reinicio..."
              className="w-full p-3 border border-gray-300 rounded mb-4 h-24"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setModalReiniciarPassword({ visible: false, usuario: null });
                  setMotivoReinicio('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReinicioPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
