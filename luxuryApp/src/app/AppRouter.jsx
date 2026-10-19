import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import PublicLayout from "../components/layout/PublicLayout";
import LoadingState from "../components/ui/LoadingState";
import HomePage from "../pages/public/HomePage";
import PrivateRoute from "./PrivateRoute";

// Cada página se descarga cuando se visita por primera vez
const TreatmentsPage = lazy(() => import("../pages/public/TreatmentsPage"));
const AboutPage = lazy(() => import("../pages/public/AboutPage"));
const BookAppointmentPage = lazy(() => import("../pages/public/BookAppointmentPage"));
const LoginPage = lazy(() => import("../pages/public/LoginPage"));
const VerifyPage = lazy(() => import("../pages/public/VerifyPage"));
const NotFoundPage = lazy(() => import("../pages/public/NotFoundPage"));

const AdminOverviewPage = lazy(() => import("../pages/admin/AdminOverviewPage"));
const StaffPage = lazy(() => import("../pages/admin/StaffPage"));
const RegisterStaffPage = lazy(() => import("../pages/admin/RegisterStaffPage"));
const DoctorOverviewPage = lazy(() => import("../pages/doctor/DoctorOverviewPage"));

const AppointmentsPage = lazy(() => import("../pages/shared/AppointmentsPage"));
const CalendarPage = lazy(() => import("../pages/shared/CalendarPage"));
const PatientsPage = lazy(() => import("../pages/shared/PatientsPage"));
const MedicalRecordsPage = lazy(() => import("../pages/shared/MedicalRecordsPage"));
const ProfilePage = lazy(() => import("../pages/shared/ProfilePage"));

// Páginas comunes a admin y doctor (cada rol ve sus propios datos)
const sharedDashboardRoutes = (
  <>
    <Route path="citas" element={<AppointmentsPage />} />
    <Route path="calendario" element={<CalendarPage />} />
    <Route path="pacientes" element={<PatientsPage />} />
    <Route path="historias" element={<MedicalRecordsPage />} />
    <Route path="perfil" element={<ProfilePage />} />
  </>
);

const AppRouter = () => (
  <Suspense fallback={<LoadingState minH="100vh" />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tratamientos" element={<TreatmentsPage />} />
        <Route path="nosotros" element={<AboutPage />} />
        <Route path="agendar" element={<BookAppointmentPage />} />
        {/* Rutas antiguas */}
        <Route path="services" element={<Navigate to="/tratamientos" replace />} />
        <Route path="solicitar-cita" element={<Navigate to="/agendar" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="login" element={<LoginPage />} />
      <Route path="verify/:id/:token" element={<VerifyPage />} />

      <Route element={<PrivateRoute roles={["admin"]} />}>
        <Route path="admin/dashboard" element={<DashboardLayout />}>
          <Route index element={<AdminOverviewPage />} />
          {sharedDashboardRoutes}
          <Route path="personal" element={<StaffPage />} />
          <Route path="registro" element={<RegisterStaffPage />} />
          <Route path="gestion" element={<Navigate to="/admin/dashboard/citas" replace />} />
          <Route path="doctors" element={<Navigate to="/admin/dashboard/personal" replace />} />
        </Route>
      </Route>

      <Route element={<PrivateRoute roles={["doctor"]} />}>
        <Route path="doctor/dashboard" element={<DashboardLayout />}>
          <Route index element={<DoctorOverviewPage />} />
          {sharedDashboardRoutes}
        </Route>
      </Route>
    </Routes>
  </Suspense>
);

export default AppRouter;
