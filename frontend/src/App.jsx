import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Plans from './components/Plans';
import Careers from './components/Careers';
import About from './components/About';
import AdminDashboard from './components/AdminDashboard';
import TrainerActivation from './components/TrainerActivation';
import TrainerDashboard from './components/TrainerDashboard';
import TrainerProfile from './components/TrainerProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import AdminScheduleBuilder from './components/AdminScheduleBuilder';
import TrainerSchedule from './components/TrainerSchedule';
import TrainerLayout from './components/TrainerLayout';
import AdminLayout from './components/AdminLayout';
import AdminFacilities from './components/AdminFacilities';
import AdminUsers from './components/AdminUsers';
import AdminRecruitmentBoard from './components/AdminRecruitmentBoard';
import AdminInventory from './components/AdminInventory';
import MemberStore from './components/MemberStore';
import MemberLayout from './components/MemberLayout';
import MemberDashboard from './components/MemberDashboard';
import MemberProfile from './components/MemberProfile';
import MemberCalendar from './components/MemberCalendar';
import AdminCheckIn from './components/AdminCheckIn';
import AdminManageStaff from './components/AdminManageStaff';
import StaffLayout from './components/StaffLayout';
import StaffDashboard from './components/StaffDashboard';
import StaffProfile from './components/StaffProfile';
import UserDirectory from './components/UserDirectory';
import EquipmentManagement from './components/EquipmentManagement';
import PublicLayout from './components/PublicLayout';

// ... inside your <Routes> block add:

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route path="/trainer/activate" element={<TrainerActivation />} />
          </Route>

          {/* Admin Routes */}
          {/* The Unified Admin App - Protected for ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/schedule-builder" element={<AdminScheduleBuilder />} />
              <Route path="/admin/facilities" element={<AdminFacilities />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/checkins" element={<AdminCheckIn />} />
              <Route path="/admin/recruitment" element={<AdminRecruitmentBoard />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/staff" element={<AdminManageStaff />} />
            </Route>
          </Route>

          {/* Trainer Routes - Protected for TRAINER only */}
          <Route element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
            <Route element={<TrainerLayout />}>
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
              <Route path="/trainer/schedule" element={<TrainerSchedule />} />
              <Route path="/trainer/profile" element={<TrainerProfile />} />
            </Route>
          </Route>

          {/* Staff Routes - Protected for STAFF only */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
            <Route element={<StaffLayout />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/directory" element={<UserDirectory />} />
              <Route path="/staff/equipment" element={<EquipmentManagement />} />
              <Route path="/staff/profile" element={<StaffProfile />} />
            </Route>
          </Route>

          {/* Member Routes - Protected for MEMBER only */}
          <Route element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
            <Route element={<MemberLayout />}>
              <Route path="/member/dashboard" element={<MemberDashboard />} />
              <Route path="/member/calendar" element={<MemberCalendar />} />
              <Route path="/member/store" element={<MemberStore />} />
              <Route path="/member/profile" element={<MemberProfile />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;