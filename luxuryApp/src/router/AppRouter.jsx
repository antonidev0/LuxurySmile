import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Signup from '../pages/signup/RegistrationForm';
import VerifyPage from '../pages/verifyPage';
import LoginPage from '../pages/login/LoginPages';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import AdminDashboard from '../pages/App/admin/AdminDashboard';
import DoctorDashboard from '../pages/App/doctor/DoctorDashboard';
import Appointment from '../pages/Appointment';
import GestionAppointment from '../pages/App/admin/GestionAppointment';
import Doctors from '../pages/App/admin/Doctors';
import Services from '../pages/Tratamientos';
import AboutUs from '../pages/Nosotros';
import MedicalHistoryForm from '../components/admin/MedicalHistoryForm';
/**
 * AppRouter define todas las rutas públicas y privadas del sistema.
 */
const AppRouter = () => (
  <Routes>
    {/* Rutas públicas */}
    <Route element={<PublicRoute />}>
      <Route index element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path='/solicitar-cita' element={<Appointment/>} /> 
      <Route path='/nosotros' element={<AboutUs/>} /> 
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="/verify/:id/:token" element={<VerifyPage />} />
    </Route>

    {/* Rutas privadas: solo ADMIN */}
    <Route element={<PrivateRoute roles={['admin']} />}>
      <Route path="admin/dashboard" element={<AdminDashboard />} />
      <Route path="admin/dashboard/gestion" element={<GestionAppointment />} />
      <Route path="admin/dashboard/doctors" element={<Doctors />} /> 
      <Route path="admin/dashboard/historias" element={<MedicalHistoryForm />} /> 
    </Route>

    {/* Rutas privadas: solo DOCTOR */}
    <Route element={<PrivateRoute roles={['doctor']} />}>
      <Route path="doctor/dashboard" element={<DoctorDashboard />} />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Home />} />
  </Routes>
);

export default AppRouter;
