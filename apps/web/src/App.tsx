import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/app/(auth)/login/page';
import Register from '@/app/auth/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
