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
          <Route path="/admin/login" element={<AdminLogin />} /> {/* Dedicated Admin Login */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Trainer Routes */}
          <Route path="/trainer/activate" element={<TrainerActivation />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;