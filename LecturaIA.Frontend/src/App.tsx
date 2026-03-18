import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EstudianteAuth from './pages/EstudianteAuth';
import DocenteAuth from './pages/DocenteAuth';
import EstudianteDashboard from './pages/EstudianteDashboard';
import LecturaDetalle from './pages/LecturaDetalle';
import LecturaVistaLectura from './pages/LecturaVistaLectura';
import CuestionarioGeneracion from './pages/CuestionarioGeneracion';
import CuestionarioRespuesta from './pages/CuestionarioRespuesta';
import CuestionarioResultados from './pages/CuestionarioResultados';
import CuestionarioRevision from './pages/CuestionarioRevision';
import HistorialResultados from './pages/HistorialResultados';
import DocenteDashboard from './pages/DocenteDashboard';
import DocenteAulasPage from './pages/DocenteAulasPage';
import AulaDetalleDocente from './pages/AulaDetalleDocente';
import AdminDashboard from './pages/AdminDashboard';
import VerificarEmail from './pages/VerificarEmail';
import RecuperarPassword from './pages/RecuperarPassword';
import PoliticasPrivacidad from './pages/PoliticasPrivacidad';
import CrearExamenGrupal from './components/docente/CrearExamenGrupal';
import ListaExamenesAsignados from './components/Estudiante/ListaExamenesAsignados';
import ResultadosExamenGrupal from './components/docente/ResultadosExamenGrupal';
import RealizarExamenGrupal from './components/Estudiante/RealizarExamenGrupal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estudiante" element={<EstudianteAuth />} />
        <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
        <Route path="/estudiante/lectura/:id" element={<LecturaDetalle />} />
        <Route path="/estudiante/leer/:id" element={<LecturaVistaLectura />} />
        <Route path="/estudiante/cuestionario/:id" element={<CuestionarioGeneracion />} />
        <Route path="/estudiante/cuestionario/:id/responder" element={<CuestionarioRespuesta />} />
        <Route path="/estudiante/cuestionario/:id/resultados" element={<CuestionarioResultados />} />
        <Route path="/estudiante/cuestionario/:id/revision" element={<CuestionarioRevision />} />
        <Route path="/estudiante/lectura/:id/historial" element={<HistorialResultados />} />
        <Route path="/estudiante/examenes" element={<ListaExamenesAsignados />} />
        <Route path="/estudiante/examen-grupal/:asignacionId" element={<RealizarExamenGrupal />} />
        <Route path="/docente" element={<DocenteAuth />} />
        <Route path="/docente/dashboard" element={<DocenteDashboard />} />
        <Route path="/docente/aulas" element={<DocenteAulasPage />} />
        <Route path="/docente/aula/:id" element={<AulaDetalleDocente />} />
        <Route path="/docente/aula/:aulaId/examen/crear" element={<CrearExamenGrupal />} />
        <Route path="/docente/examen/:examenId/resultados" element={<ResultadosExamenGrupal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
