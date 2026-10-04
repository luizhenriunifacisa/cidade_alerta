import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getIniciais } from '../utils/helpers';

export default function Navbar() {
  const { usuario, logout, isAutenticado, isAdmin, isModerador } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Início', icon: '🏠' },
    { to: '/reportes', label: 'Reportes', icon: '📋' },
  ];

  if (isAutenticado) {
    navLinks.push({ to: '/meus-reportes', label: 'Meus Reportes', icon: '📝' });
  }

  if (isModerador) {
    navLinks.push({ to: '/dashboard', label: 'Dashboard', icon: '📊' });
  }

  if (isAdmin) {
    navLinks.push({ to: '/admin/categorias', label: 'Categorias', icon: '🏷️' });
    navLinks.push({ to: '/admin/usuarios', label: 'Usuários', icon: '👥' });
  }

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand" id="navbar-brand">
            <div className="navbar-brand-icon">!</div>
            <span>CidadeAlerta</span>
          </Link>

          <ul className="navbar-nav" id="navbar-nav">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? 'active' : ''}`
                  }
                  end={link.to === '/'}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            {isAutenticado ? (
              <div className="navbar-user" id="navbar-user">
                <div className="navbar-avatar">
                  {getIniciais(usuario?.nome)}
                </div>
                <span className="navbar-username">{usuario?.nome}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleLogout}
                  id="btn-logout"
                >
                  Sair
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" id="btn-login-nav">
                  Entrar
                </Link>
                <Link to="/registro" className="btn btn-primary btn-sm" id="btn-registro-nav">
                  Cadastrar
                </Link>
              </>
            )}

            <button
              className="navbar-menu-toggle"
              onClick={() => setMobileOpen(true)}
              id="navbar-menu-toggle"
              aria-label="Abrir menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Menu</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
            end={link.to === '/'}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          {isAutenticado ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="navbar-avatar">{getIniciais(usuario?.nome)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{usuario?.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{usuario?.email}</div>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
                Entrar
              </Link>
              <Link to="/registro" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
