import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/common/Toast'
import ProtectedRoute from './routes/ProtectedRoute'

// Public
import LandingPage       from './pages/LandingPage'
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/auth'
import VerifyEmailPage  from './pages/auth/VerifyEmailPage'
import UnauthorizedPage  from './pages/UnauthorizedPage'
import NotFoundPage      from './pages/NotFoundPage'

// Legal / Info pages
import TermsPage         from './pages/legal/TermsPage'
import PrivacyPage       from './pages/legal/PrivacyPage'
import ContactPage       from './pages/legal/ContactPage'
import AboutPage         from './pages/legal/AboutPage'
import DisclaimerPage    from './pages/legal/DisclaimerPage'

// Patient
import DashboardPage     from './pages/patient/DashboardPage'
import JournalPage       from './pages/patient/JournalPage'
import JournalNewPage    from './pages/patient/JournalNewPage'
import JournalDetailPage from './pages/patient/JournalDetailPage'
import AssessmentPage    from './pages/patient/AssessmentPage'
import AssessmentTakePage from './pages/patient/AssessmentTakePage'
import ChatPage          from './pages/patient/ChatPage'
import MoodPage          from './pages/patient/MoodPage'
import WellnessPage      from './pages/patient/WellnessPage'
import CarePage          from './pages/patient/CarePage'
import AppointmentsPage  from './pages/patient/AppointmentsPage'
import ProfilePage       from './pages/patient/ProfilePage'
import SettingsPage      from './pages/patient/SettingsPage'
import NotificationsPage from './pages/patient/NotificationsPage'

// Doctor
import DoctorDashboard   from './pages/doctor/DoctorDashboard'
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage'
import DoctorAnalyticsPage from './pages/doctor/DoctorAnalyticsPage'
import DoctorRiskPage    from './pages/doctor/DoctorRiskPage'

// Shared
import MessagesPage from './pages/MessagesPage'

// Admin
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminUsersPage    from './pages/admin/AdminUsersPage'
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminAssessmentsPage from './pages/admin/AdminAssessmentsPage'
import AdminProfessionalsPage from './pages/admin/AdminProfessionalsPage'

const PATIENT_ROLES = ['patient']
const DOCTOR_ROLES  = ['doctor']
const ADMIN_ROLES   = ['admin']
const ALL_ROLES     = ['patient', 'doctor', 'admin']

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ──────────────────────────── */}
            <Route path="/"                 element={<LandingPage />} />
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/register"         element={<RegisterPage />} />
            <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
            <Route path="/verify-email"     element={<VerifyEmailPage />} />
            <Route path="/unauthorized"     element={<UnauthorizedPage />} />

            {/* ── Legal / Info ─────────────────────── */}
            <Route path="/terms"            element={<TermsPage />} />
            <Route path="/privacy"          element={<PrivacyPage />} />
            <Route path="/contact"          element={<ContactPage />} />
            <Route path="/about"            element={<AboutPage />} />
            <Route path="/disclaimer"       element={<DisclaimerPage />} />

            {/* ── Patient ─────────────────────────── */}
            <Route path="/dashboard"   element={<ProtectedRoute roles={PATIENT_ROLES}><DashboardPage /></ProtectedRoute>} />
            <Route path="/journal"     element={<ProtectedRoute roles={PATIENT_ROLES}><JournalPage /></ProtectedRoute>} />
            <Route path="/journal/new" element={<ProtectedRoute roles={PATIENT_ROLES}><JournalNewPage /></ProtectedRoute>} />
            <Route path="/journal/:id" element={<ProtectedRoute roles={PATIENT_ROLES}><JournalDetailPage /></ProtectedRoute>} />
            <Route path="/assessment"  element={<ProtectedRoute roles={PATIENT_ROLES}><AssessmentPage /></ProtectedRoute>} />
            <Route path="/assessment/:type" element={<ProtectedRoute roles={PATIENT_ROLES}><AssessmentTakePage /></ProtectedRoute>} />
            <Route path="/chat"        element={<ProtectedRoute roles={PATIENT_ROLES}><ChatPage /></ProtectedRoute>} />
            <Route path="/mood"        element={<ProtectedRoute roles={PATIENT_ROLES}><MoodPage /></ProtectedRoute>} />
            <Route path="/wellness"    element={<ProtectedRoute roles={PATIENT_ROLES}><WellnessPage /></ProtectedRoute>} />
            <Route path="/care"        element={<ProtectedRoute roles={PATIENT_ROLES}><CarePage /></ProtectedRoute>} />
            <Route path="/doctors"     element={<ProtectedRoute roles={PATIENT_ROLES}><CarePage /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute roles={PATIENT_ROLES}><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/messages"     element={<ProtectedRoute roles={ALL_ROLES}><MessagesPage /></ProtectedRoute>} />
            <Route path="/profile"     element={<ProtectedRoute roles={ALL_ROLES}><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute roles={ALL_ROLES}><SettingsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute roles={ALL_ROLES}><NotificationsPage /></ProtectedRoute>} />

            {/* ── Doctor ──────────────────────────── */}
            <Route path="/doctor/dashboard"    element={<ProtectedRoute roles={DOCTOR_ROLES}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients"     element={<ProtectedRoute roles={DOCTOR_ROLES}><DoctorPatientsPage /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute roles={DOCTOR_ROLES}><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/doctor/analytics"    element={<ProtectedRoute roles={DOCTOR_ROLES}><DoctorAnalyticsPage /></ProtectedRoute>} />
            <Route path="/doctor/risk"         element={<ProtectedRoute roles={DOCTOR_ROLES}><DoctorRiskPage /></ProtectedRoute>} />
            <Route path="/doctor/messages"     element={<ProtectedRoute roles={DOCTOR_ROLES}><MessagesPage /></ProtectedRoute>} />

            {/* ── Admin ───────────────────────────── */}
            <Route path="/admin/dashboard"     element={<ProtectedRoute roles={ADMIN_ROLES}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users"         element={<ProtectedRoute roles={ADMIN_ROLES}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/professionals" element={<ProtectedRoute roles={ADMIN_ROLES}><AdminProfessionalsPage /></ProtectedRoute>} />
            <Route path="/admin/appointments"  element={<ProtectedRoute roles={ADMIN_ROLES}><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/admin/assessments"   element={<ProtectedRoute roles={ADMIN_ROLES}><AdminAssessmentsPage /></ProtectedRoute>} />
            <Route path="/admin/analytics"     element={<ProtectedRoute roles={ADMIN_ROLES}><AdminAnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/audit-logs"    element={<ProtectedRoute roles={ADMIN_ROLES}><AdminAuditLogsPage /></ProtectedRoute>} />
            <Route path="/admin/settings"      element={<ProtectedRoute roles={ADMIN_ROLES}><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin/risk"          element={<ProtectedRoute roles={ADMIN_ROLES}><AdminAssessmentsPage /></ProtectedRoute>} />

            {/* ── Fallback ────────────────────────── */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*"    element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
