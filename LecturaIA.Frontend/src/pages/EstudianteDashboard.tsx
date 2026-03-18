import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CambiarPasswordModal from '../components/CambiarPasswordModal';
import MiPerfilModal from '../components/MiPerfilModal';
import MiClaseModal from '../components/MiClaseModal';
import EncuestaGuiadaModal, { type PreferenciasLectura } from '../components/EncuestaGuiadaModal';
import VistaPreviaPreferenciasModal from '../components/VistaPreviaPreferenciasModal';
import AyudaContextual from '../components/AyudaContextual';
import TutorialInicial from '../components/TutorialInicial';
import { lecturaService, type LecturaLista } from '../services/lecturaService';
import { ayudaService } from '../services/ayudaService';
import { contenidoAyuda, tutorialEstudiante } from '../data/contenidoAyuda';

type TabType = 'lista' | 'favoritas';

export default function EstudianteDashboard() {
  const [usuario, setUsuario] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showClaseModal, setShowClaseModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterNivel, setFilterNivel] = useState('todos');
  const navigate = useNavigate();

  // Estados para la encuesta y generación de lecturas
  const [showEncuesta, setShowEncuesta] = useState(false);
  const [showVistaPrevia, setShowVistaPrevia] = useState(false);
  const [preferenciasActuales, setPreferenciasActuales] = useState<PreferenciasLectura | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lecturas del estudiante (ahora desde API)
  const [lecturas, setLecturas] = useState<LecturaLista[]>([]);
  const [isLoadingLecturas, setIsLoadingLecturas] = useState(true);

  // Estados para tutorial y ayuda
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [cargandoTutorial, setCargandoTutorial] = useState(true);

  // Cargar usuario y lecturas
  useEffect(() => {
    const user = localStorage.getItem('userData');
    if (!user) {
      navigate('/estudiante');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.tipoUsuario !== 'Estudiante') {
      navigate('/');
      return;
    }

    setUsuario(userData);
    cargarLecturas();
    verificarPrimeraSesion();
  }, [navigate]);

  // Recargar lecturas cuando el usuario regresa a esta página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cargarLecturas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // También recargar cuando el componente se monta (navegación desde otra página)
    window.addEventListener('focus', cargarLecturas);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', cargarLecturas);
    };
  }, []);

  const verificarPrimeraSesion = async () => {
    try {
      const estado = await ayudaService.obtenerEstadoTutorial();
      if (estado.primeraSesion) {
        setMostrarTutorial(true);
      }
    } catch (error) {
      console.error('Error al verificar tutorial:', error);
    } finally {
      setCargandoTutorial(false);
    }
  };

  const cargarLecturas = async () => {
    try {
      setIsLoadingLecturas(true);
      const lecturasData = await lecturaService.obtenerLecturas();
      setLecturas(lecturasData);
    } catch (error) {
      console.error('Error al cargar lecturas:', error);
    } finally {
      setIsLoadingLecturas(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/estudiante');
  };

  const handleGenerarLectura = () => {
    setShowEncuesta(true);
  };

  const handleEncuestaComplete = (preferencias: PreferenciasLectura) => {
    setPreferenciasActuales(preferencias);
    setShowEncuesta(false);
    setShowVistaPrevia(true);
  };

  const handleGenerarLecturaConIA = async () => {
    if (!preferenciasActuales) return;

    try {
      setIsGenerating(true);
      const lecturaGenerada = await lecturaService.generarLectura(preferenciasActuales);
      
      // Cerrar modales
      setShowVistaPrevia(false);
      setPreferenciasActuales(null);
      setIsGenerating(false);

      // Recargar lecturas
      await cargarLecturas();

      // Navegar a la lectura generada
      navigate(`/estudiante/lectura/${lecturaGenerada.id}`);
    } catch (error: any) {
      setIsGenerating(false);
      alert(error.message || 'Error al generar la lectura');
    }
  };

  const handleEliminarLectura = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta lectura?')) {
      try {
        console.log('Intentando eliminar lectura con ID:', id);
        await lecturaService.eliminarLectura(id);
        console.log('Lectura eliminada exitosamente');
        // Recargar la lista de lecturas
        await cargarLecturas();
        alert('Lectura eliminada exitosamente');
      } catch (error: any) {
        console.error('Error al eliminar lectura:', error);
        alert(`Error al eliminar la lectura: ${error.message}`);
      }
    }
  };

  const handleToggleFavorita = async (id: number, esFavorita: boolean) => {
    try {
      await lecturaService.toggleFavorita(id, !esFavorita);
      // Recargar la lista de lecturas
      await cargarLecturas();
    } catch (error: any) {
      alert(`Error al actualizar favorita: ${error.message}`);
    }
  };

  const handleComenzarLectura = (id: number) => {
    navigate(`/estudiante/leer/${id}`);
  };

  // Filtrar lecturas según búsqueda, filtros y tab activa
  const lecturasFiltradas = lecturas.filter(lectura => {
    const matchSearch = lectura.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'todos' || lectura.tipoLectura === filterTipo;
    const matchLongitud = filterNivel === 'todos' || lectura.longitud === filterNivel;
    const matchTab = activeTab === 'lista' || (activeTab === 'favoritas' && lectura.esFavorita);
    return matchSearch && matchTipo && matchLongitud && matchTab;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en-progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en-progreso':
        return 'En Progreso';
      case 'pendiente':
        return 'Pendiente';
      default:
        return 'Pendiente';
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center min-w-[90px]">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 className="text-2xl font-bold">LecturaIA - Estudiante</h1>
            </div>
            
            {/* Botón Mis Exámenes */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/estudiante/examenes')}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Mis Exámenes</span>
              </button>
            </div>
            
            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{usuario.nombreCompleto}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenuDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowPerfilModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Ver Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowClaseModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Mi Clase</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Cambiar Contraseña</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Área de trabajo del estudiante */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con tabs y botón Mi perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Área de Trabajo</h2>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('lista')}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === 'lista'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Lista de Lecturas
            </button>
            <button
              onClick={() => setActiveTab('favoritas')}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === 'favoritas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Lecturas Favoritas
            </button>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'lista' && (
          <div className="space-y-6">
            {/* Buscador con filtros y botón Generar Nueva Lectura */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Buscador */}
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar lecturas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtro por tipo */}
                <div>
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="Narrativa">Narrativa</option>
                    <option value="Descriptiva">Descriptiva</option>
                    <option value="Argumentativa">Argumentativa</option>
                    <option value="Expositiva">Expositiva</option>
                    <option value="Informativa">Informativa</option>
                  </select>
                </div>

                {/* Filtro por longitud */}
                <div>
                  <select
                    value={filterNivel}
                    onChange={(e) => setFilterNivel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todas las longitudes</option>
                    <option value="Corta">Corta</option>
                    <option value="Mediana">Mediana</option>
                    <option value="Larga">Larga</option>
                  </select>
                </div>

                {/* Botón Generar Nueva Lectura */}
                <div>
                  <button
                    onClick={handleGenerarLectura}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Generar Nueva Lectura</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Listado de lecturas */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Título
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tipo
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Long.
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Fecha
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Progreso
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Estado
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Fav
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingLecturas ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-lg font-medium">Cargando tus lecturas...</p>
                          </div>
                        </td>
                      </tr>
                    ) : lecturasFiltradas.length > 0 ? (
                      lecturasFiltradas.map((lectura) => (
                        <tr key={lectura.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={lectura.titulo}>{lectura.titulo}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{lectura.tipoLectura}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{lectura.longitud}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{new Date(lectura.fechaCreacion).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: '2-digit'})}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center min-w-[90px]">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-1.5">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${lectura.progreso}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 w-10 text-right">{lectura.progreso}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(lectura.estado)}`}>
                              {getEstadoTexto(lectura.estado)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleFavorita(lectura.id, lectura.esFavorita)}
                              className={`p-1 transition ${lectura.esFavorita ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-500'}`}
                              title={lectura.esFavorita ? "Quitar de favoritas" : "Agregar a favoritas"}
                            >
                              <svg className="w-5 h-5" fill={lectura.esFavorita ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex flex-wrap justify-end items-center gap-2">
                              {/* Botón principal según estado */}
                              {lectura.estado === 'pendiente' && (
                                <button
                                  onClick={() => handleComenzarLectura(lectura.id)}
                                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Comenzar a leer"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Comenzar</span></button>
                              )}
                              {lectura.estado === 'en_progreso' && (
                                <button
                                  onClick={() => handleComenzarLectura(lectura.id)}
                                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Continuar lectura"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Continuar</span></button>
                              )}
                              {lectura.estado === 'completado' && (
                                <button
                                  onClick={() => handleComenzarLectura(lectura.id)}
                                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Volver a leer"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg><span>Volver a intentar</span></button>
                              )}
                              {lectura.estado === 'completado' && !lectura.cuestionarioEvaluado && (
                                <button
                                  onClick={() => navigate(`/estudiante/lectura/${lectura.id}`)}
                                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Ir a cuestionario"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg><span>Cuestionario</span></button>
                              )}
                              {lectura.cuestionarioEvaluado && lectura.cuestionarioId && (
                                <button
                                  onClick={() => navigate(`/estudiante/cuestionario/${lectura.id}/resultados?cuestionarioId=${lectura.cuestionarioId}`)}
                                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Ver resultados del cuestionario"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Resultados</span></button>
                              )}
                              
                              {/* Botones secundarios */}
                              {lectura.cuestionarioEvaluado && (
                                <button
                                  onClick={() => navigate(`/estudiante/lectura/${lectura.id}/historial`)}
                                  className="flex items-center gap-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 px-2 py-1.5 rounded transition text-xs whitespace-nowrap"
                                  title="Ver historial de resultados"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Historial</span></button>
                              )}
                              <button
                                onClick={() => handleEliminarLectura(lectura.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1.5 rounded transition text-xs whitespace-nowrap"
                                title="Eliminar lectura"
                              ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg><span>Eliminar</span></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium">
                              {activeTab === ('favoritas' as TabType) ? 'No tienes lecturas favoritas' : 'No se encontraron lecturas'}
                            </p>
                            <p className="text-sm mt-2">
                              {activeTab === ('favoritas' as TabType)
                                ? 'Marca una lectura como favorita usando la estrella ⭐' 
                                : 'Intenta ajustar los filtros de búsqueda'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === ('favoritas' as TabType) && (
          <div className="space-y-6">
            {/* Mismo contenedor de tabla que en 'lista' */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Título
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tipo
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Longitud
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Fecha
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Progreso
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Estado
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Fav
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingLecturas ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-lg font-medium">Cargando tus lecturas...</p>
                          </div>
                        </td>
                      </tr>
                    ) : lecturasFiltradas.length > 0 ? (
                      lecturasFiltradas.map((lectura) => (
                        <tr key={lectura.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={lectura.titulo}>{lectura.titulo}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{lectura.tipoLectura}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{lectura.longitud}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{new Date(lectura.fechaCreacion).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: '2-digit'})}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center min-w-[90px]">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-1.5">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${lectura.progreso}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 w-10 text-right">{lectura.progreso}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(lectura.estado)}`}>
                              {getEstadoTexto(lectura.estado)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleFavorita(lectura.id, lectura.esFavorita)}
                              className={`p-1 transition ${lectura.esFavorita ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-500'}`}
                              title={lectura.esFavorita ? "Quitar de favoritas" : "Agregar a favoritas"}
                            >
                              <svg className="w-5 h-5" fill={lectura.esFavorita ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex flex-wrap justify-end items-center gap-2">
                              {/* Botón principal según estado */}
                              {lectura.estado === 'pendiente' && (
                                <button
                                  onClick={() => handleComenzarLectura(lectura.id)}
                                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Comenzar a leer"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Comenzar</span></button>
                              )}
                              {lectura.estado === 'en_progreso' && (
                                <button
                                  onClick={() => handleComenzarLectura(lectura.id)}
                                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Continuar lectura"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Continuar</span></button>
                              )}
                              {lectura.estado === 'completado' && (
                                <button
                                  onClick={() => handleComenzarLectura(lectura.id)}
                                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Volver a leer"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg><span>Volver a intentar</span></button>
                              )}
                              {lectura.estado === 'completado' && !lectura.cuestionarioEvaluado && (
                                <button
                                  onClick={() => navigate(`/estudiante/lectura/${lectura.id}`)}
                                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Ir a cuestionario"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg><span>Cuestionario</span></button>
                              )}
                              {lectura.cuestionarioEvaluado && lectura.cuestionarioId && (
                                <button
                                  onClick={() => navigate(`/estudiante/cuestionario/${lectura.id}/resultados?cuestionarioId=${lectura.cuestionarioId}`)}
                                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                                  title="Ver resultados del cuestionario"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Resultados</span></button>
                              )}
                              
                              {/* Botones secundarios */}
                              {lectura.cuestionarioEvaluado && (
                                <button
                                  onClick={() => navigate(`/estudiante/lectura/${lectura.id}/historial`)}
                                  className="flex items-center gap-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 px-2 py-1.5 rounded transition text-xs whitespace-nowrap"
                                  title="Ver historial de resultados"
                                ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg><span>Historial</span></button>
                              )}
                              <button
                                onClick={() => handleEliminarLectura(lectura.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1.5 rounded transition text-xs whitespace-nowrap"
                                title="Eliminar lectura"
                              ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg><span>Eliminar</span></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <p className="text-lg font-medium">No tienes lecturas favoritas</p>
                            <p className="text-sm mt-2">Marca una lectura como favorita usando la estrella ⭐</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cambiar Contraseña */}
      <CambiarPasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />

      {/* Modal de Mi Perfil */}
      <MiPerfilModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
      />

      {/* Modal de Mi Clase */}
      <MiClaseModal
        isOpen={showClaseModal}
        onClose={() => setShowClaseModal(false)}
      />

      {/* Modal de Encuesta Guiada */}
      <EncuestaGuiadaModal
        isOpen={showEncuesta}
        onClose={() => setShowEncuesta(false)}
        onComplete={handleEncuestaComplete}
      />

      {/* Modal de Vista Previa de Preferencias */}
      {preferenciasActuales && (
        <VistaPreviaPreferenciasModal
          isOpen={showVistaPrevia}
          preferencias={preferenciasActuales}
          onClose={() => {
            setShowVistaPrevia(false);
            setPreferenciasActuales(null);
          }}
          onGenerarLectura={handleGenerarLecturaConIA}
          isGenerating={isGenerating}
        />
      )}

      {/* Ayuda Contextual */}
      {!cargandoTutorial && !mostrarTutorial && (
        <AyudaContextual
          pantalla="Dashboard Estudiante"
          contenido={contenidoAyuda.estudianteDashboard}
          onVerTutorial={() => setMostrarTutorial(true)}
        />
      )}

      {/* Tutorial Inicial */}
      {mostrarTutorial && (
        <TutorialInicial
          pasos={tutorialEstudiante}
          onCompletar={() => setMostrarTutorial(false)}
          onOmitir={() => setMostrarTutorial(false)}
          tipoUsuario="Estudiante"
        />
      )}
    </div>
  );
}

