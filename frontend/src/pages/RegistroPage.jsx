import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function RegistroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { registro } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if (senha.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await registro(nome, email, senha);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta.');
    } finally {
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
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Junte-se à comunidade e reporte problemas</p>
        </div>

        <form onSubmit={handleSubmit} id="registro-form">
          <div className="form-group">
            <label className="form-label" htmlFor="nome">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              className="form-input"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              className="form-input"
              placeholder="Mínimo 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmar-senha">
              Confirmar senha
            </label>
            <input
              id="confirmar-senha"
              type="password"
              className="form-input"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-4)' }}
            disabled={carregando}
            id="btn-registro"
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <Link to="/login">Fazer login</Link>
        </div>
      </div>
    </div>
  );
}
