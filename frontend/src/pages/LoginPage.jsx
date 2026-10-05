import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const {login} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) =>{
    e.preventDefault();

    if(!email || !senha) {
      toast.error('Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try{
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    }
    catch(err) {
      toast.error(err.message || 'Erro ao fazer login.');
    }
    finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">!</div>
          </div>
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required/>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="senha">Senha</label>
            <input id="senha" type="password" className="form-input" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required/>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)' }} disabled={carregando} id="btn-login">
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          Não tem uma conta?{' '}
          <Link to="/registro">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}
