import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RotaPrivada({ children }) {
  const { isAutenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Carregando...</span>
      </div>
    );
  }

  return isAutenticado ? children : <Navigate to="/login" replace />;
}

export function RotaAdmin({ children }) {
  const { isAdmin, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Carregando...</span>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/" replace />;
}

export function RotaModerador({ children }) {
  const { isModerador, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Carregando...</span>
      </div>
    );
  }

  return isModerador ? children : <Navigate to="/" replace />;
}
