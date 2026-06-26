import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import Journal from './pages/Journal';
import Affirmations from './pages/Affirmations';
import Profile from './pages/Profile';
import Questionnaire from './pages/Questionnaire';
import Emergency from './pages/Emergency';
import ActionPlan from './pages/ActionPlan';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/modulos" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
          <Route path="/modulos/:id" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
          <Route path="/diario" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/afirmaciones" element={<ProtectedRoute><Affirmations /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cuestionario" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
          <Route path="/emergencia" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
          <Route path="/plan" element={<ProtectedRoute><ActionPlan /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
