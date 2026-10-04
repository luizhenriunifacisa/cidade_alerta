import { useState, useEffect } from 'react';
import { usuariosApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PERFIL_LABELS, getIniciais, formatarData } from '../utils/helpers';

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const toast = useToast();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const res = await usuariosApi.listar();
      setUsuarios(res.data?.usuarios || res.data || []);
    } catch {
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  };

  const alterarPapel = async (id, perfil) => {
    try {
      await usuariosApi.alterarPapel(id, perfil);
      toast.success('Perfil atualizado!');
      carregarUsuarios();
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar perfil.');
    }
  };

  const alterarStatus = async (id, ativo) => {
    try {
      await usuariosApi.alterarStatus(id, ativo);
      toast.success(ativo ? 'Usuário ativado!' : 'Usuário desativado!');
      carregarUsuarios();
    } catch (err) {
      toast.error(err.message || 'Erro ao alterar status.');
    }
  };

  const PERFIL_COLORS = {
    admin: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.25)' },
    moderador: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.25)' },
    cidadao: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)' },
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">👥 Usuários</h1>
          <p className="page-subtitle">Gerencie os usuários da plataforma</p>
        </div>

        {carregando ? (
          <div className="loading-container">
            <div className="spinner" />
            <span className="loading-text">Carregando...</span>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3 className="empty-state-title">Nenhum usuário</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {usuarios.map((user, i) => {
              const perfilColor = PERFIL_COLORS[user.perfil] || PERFIL_COLORS.cidadao;
              return (
                <div
                  key={user._id}
                  className="card slide-up"
                  style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'backwards' }}
                >
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)', flexWrap: 'wrap' }}>
                    <div className="navbar-avatar" style={{ flexShrink: 0 }}>
                      {getIniciais(user.nome)}
                    </div>

                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {user.nome}
                        {!user.ativo && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', fontWeight: 500 }}>
                            (Inativo)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {user.email}
                      </div>
                    </div>

                    <span
                      className="badge"
                      style={{
                        background: perfilColor.bg,
                        color: perfilColor.text,
                        border: `1px solid ${perfilColor.border}`,
                      }}
                    >
                      {PERFIL_LABELS[user.perfil]}
                    </span>

                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', minWidth: '100px' }}>
                      📅 {formatarData(user.createdAt)}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                      <select
                        className="form-select"
                        value={user.perfil}
                        onChange={(e) => alterarPapel(user._id, e.target.value)}
                        style={{ padding: 'var(--space-1) var(--space-6) var(--space-1) var(--space-2)', fontSize: 'var(--font-size-xs)', width: 'auto' }}
                        id={`select-perfil-${user._id}`}
                      >
                        <option value="cidadao">Cidadão</option>
                        <option value="moderador">Moderador</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        className={`btn btn-sm ${user.ativo ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => alterarStatus(user._id, !user.ativo)}
                        style={{ fontSize: 'var(--font-size-xs)' }}
                        id={`btn-toggle-${user._id}`}
                      >
                        {user.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
