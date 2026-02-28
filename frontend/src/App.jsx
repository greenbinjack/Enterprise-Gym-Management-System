import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Plans from './components/Plans';
import Careers from './components/Careers'; // ADD THIS
import AdminDashboard from './components/AdminDashboard'; // ADD THIS
import AdminLogin from './components/AdminLogin'; // ADD THIS IMPORT
import TrainerActivation from './components/TrainerActivation';
import TrainerDashboard from './components/TrainerDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminScheduleBuilder from './components/AdminScheduleBuilder';
import TrainerSchedule from './components/TrainerSchedule';
import AdminLayout from './components/AdminLayout';
import AdminFacilities from './components/AdminFacilities';
import AdminUsers from './components/AdminUsers';
import AdminRecruitmentBoard from './components/AdminRecruitmentBoard';
import AdminInventory from './components/AdminInventory';
import MemberStore from './components/MemberStore';
import MemberLayout from './components/MemberLayout';
import MemberDashboard from './components/MemberDashboard';
import MemberProfile from './components/MemberProfile';

// ... inside your <Routes> block add:

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/careers" element={<Careers />} /> {/* Public */}
          {/* Admin Routes */}
          {/* Public & Member Routes remain standard */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* The Unified Admin App */}
          <Route element={<AdminLayout />}>
            {/* All these pages will now render INSIDE the layout alongside the sidebar! */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/schedule-builder" element={<AdminScheduleBuilder />} />
            <Route path="/admin/facilities" element={<AdminFacilities />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/recruitment" element={<AdminRecruitmentBoard />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
          </Route>
          {/* Trainer Routes */}
          <Route path="/trainer/activate" element={<TrainerActivation />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/trainer/schedule" element={<TrainerSchedule />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<MemberLayout />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/store" element={<MemberStore />} />
            <Route path="/member/profile" element={<MemberProfile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;