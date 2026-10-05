import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { reportesApi } from '../services/api';
import {GET_REPORTE, ATUALIZAR_STATUS_REPORTE, ADICIONAR_COMENTARIO,} from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  STATUS_LABELS,
  STATUS_LIST,
  formatarDataHora,
  tempoRelativo,
  getIniciais,
  getId,
} from '../utils/helpers';

export default function ReporteDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, isAdmin, isModerador } = useAuth();
  const toast = useToast();

  const [comentarios, setComentarios] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [novoStatus, setNovoStatus] = useState('');
  const [observacao, setObservacao] = useState('');
  const [mostrarAlterarStatus, setMostrarAlterarStatus] = useState(false);

  const { data, loading, error } = useQuery(GET_REPORTE, { variables: { id } });
  const reporte = data?.reporte;
  const carregando = loading && !data;

  const [atualizarStatusMutation, { loading: alterandoStatus }] = useMutation(ATUALIZAR_STATUS_REPORTE);
  const [adicionarComentarioMutation, { loading: enviando }] = useMutation(ADICIONAR_COMENTARIO);

  useEffect(() => {
    if (error || (!loading && data && !data.reporte)) {
      toast.error('Reporte não encontrado.');
      navigate('/reportes');
    }
  }, [error, loading, data]);

  const carregarHistorico = useCallback(() => {
    reportesApi.historico(id)
      .then((res) => setHistorico(res.data?.historico || []))
      .catch(() => setHistorico([]));
  }, [id]);

  useEffect(() => {
    reportesApi.comentarios(id)
      .then((res) => setComentarios(res.data?.comentarios || []))
      .catch(() => setComentarios([]));
    carregarHistorico();
  }, [id, carregarHistorico]);

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    try {
      const { data: res } = await adicionarComentarioMutation({
        variables: { reporteId: id, conteudo: novoComentario.trim() },
      });
      setComentarios((prev) => [...prev, res.adicionarComentario]);
      setNovoComentario('');
      toast.success('Comentário adicionado!');
    } catch (err) {
      toast.error(err.message || 'Erro ao adicionar comentário.');
    }
  };

  const alterarStatus = async () => {
    if (!novoStatus) return;
    try {
      await atualizarStatusMutation({
        variables: { id, status: novoStatus, observacao: observacao || null },
      });
      toast.success('Status atualizado!');
      setMostrarAlterarStatus(false);
      setObservacao('');
      carregarHistorico();
    }
    catch (err) {
      toast.error(err.message || 'Erro ao alterar status.');
    }
  };

  const deletarReporte = async () => {
    if (!window.confirm('Tem certeza que deseja deletar este reporte?')) return;
    try {
      await reportesApi.deletar(id);
      toast.success('Reporte deletado.');
      navigate('/reportes');
    } catch (err) {
      toast.error(err.message || 'Erro ao deletar reporte.');
    }
  };

  if (carregando) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <span className="loading-text">Carregando reporte...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!reporte) return null;

  const isAutor = usuario && reporte.autor && getId(usuario) === getId(reporte.autor);

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
          <Link to="/reportes" style={{ color: 'var(--color-text-muted)' }}>← Voltar aos reportes</Link>
        </div>

        <div className="report-detail fade-in">
          <div className="report-detail-main">
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, lineHeight: 1.3 }}>
                  {reporte.titulo}
                </h1>
                <span className={`badge badge-${reporte.status}`} style={{ flexShrink: 0 }}>
                  <span className="badge-dot" />
                  {STATUS_LABELS[reporte.status]}
                </span>
              </div>
              <div className="report-card-meta" style={{ marginBottom: 'var(--space-6)' }}>
                {reporte.autor && (
                  <span className="report-card-meta-item">
                    👤 {reporte.autor.nome}
                  </span>
                )}
                <span className="report-card-meta-item">
                  🕐 {tempoRelativo(reporte.createdAt)}
                </span>
                {reporte.categoria && (
                  <span className="report-card-meta-item">
                    🏷️ {reporte.categoria.nome}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="detail-section">
              <h2 className="detail-section-title">Descrição</h2>
              <div className="card">
                <div className="card-body">
                  <p style={{
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {reporte.descricao}
                  </p>
                </div>
              </div>
            </div>

            {/* Images */}
            {reporte.imagens && reporte.imagens.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">Imagens</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                  {reporte.imagens.map((img, i) => (
                    <div key={i} className="card" style={{ overflow: 'hidden' }}>
                      <img
                        src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${img}`}
                        alt={`Imagem ${i + 1} do reporte`}
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="detail-section">
              <h2 className="detail-section-title">
                Comentários ({comentarios.length})
              </h2>

              {usuario && (
                <form onSubmit={enviarComentario} style={{ marginBottom: 'var(--space-6)' }}>
                  <div className="form-group">
                    <textarea
                      className="form-textarea"
                      placeholder="Escreva um comentário..."
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      rows={3}
                      id="input-comentario"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={enviando || !novoComentario.trim()}
                    id="btn-comentar"
                  >
                    {enviando ? 'Enviando...' : '💬 Comentar'}
                  </button>
                </form>
              )}

              {comentarios.length === 0 ? (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  Nenhum comentário ainda.
                </p>
              ) : (
                comentarios.map((c) => (
                  <div key={getId(c)} className="comment">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="comment-avatar">
                          {getIniciais(c.autor?.nome)}
                        </div>
                        <span className="comment-name">{c.autor?.nome || 'Anônimo'}</span>
                      </div>
                      <span className="comment-date">{tempoRelativo(c.createdAt)}</span>
                    </div>
                    <p className="comment-body">{c.conteudo}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="report-detail-sidebar">
            {/* Actions */}
            {(isAutor || isAdmin || isModerador) && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Ações</h3>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {isModerador && (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setNovoStatus(reporte.status);
                        setMostrarAlterarStatus(!mostrarAlterarStatus);
                      }}
                      id="btn-alterar-status"
                    >
                      🔄 Alterar Status
                    </button>
                  )}

                  {isAutor && (
                    <Link to={`/reportes/${id}/editar`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }} id="btn-editar-reporte">
                      ✏️ Editar
                    </Link>
                  )}

                  {isAdmin && (
                    <button className="btn btn-danger" style={{ width: '100%' }} onClick={deletarReporte} id="btn-deletar-reporte">
                      🗑️ Deletar
                    </button>
                  )}
                </div>

                {/* Status change form */}
                {mostrarAlterarStatus && (
                  <div className="card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <select
                      className="form-select"
                      value={novoStatus}
                      onChange={(e) => setNovoStatus(e.target.value)}
                      id="select-status"
                    >
                      {STATUS_LIST.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <input
                      className="form-input"
                      placeholder="Observação (opcional)"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      id="input-observacao"
                    />
                    <button className="btn btn-primary btn-sm" onClick={alterarStatus} disabled={alterandoStatus} id="btn-confirmar-status">
                      {alterandoStatus ? 'Salvando...' : 'Confirmar'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Informações</h3>
              </div>
              <div className="card-body">
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-item-icon">📅</span>
                    <div>
                      <div className="info-item-label">Criado em</div>
                      <div className="info-item-value">{formatarDataHora(reporte.createdAt)}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-item-icon">🔄</span>
                    <div>
                      <div className="info-item-label">Atualizado em</div>
                      <div className="info-item-value">{formatarDataHora(reporte.updatedAt)}</div>
                    </div>
                  </div>
                  {reporte.endereco && (
                    <div className="info-item">
                      <span className="info-item-icon">📍</span>
                      <div>
                        <div className="info-item-label">Endereço</div>
                        <div className="info-item-value">{reporte.endereco}</div>
                      </div>
                    </div>
                  )}
                  {reporte.localizacao?.coordinates && (
                    <div className="info-item">
                      <span className="info-item-icon">🗺️</span>
                      <div>
                        <div className="info-item-label">Coordenadas</div>
                        <div className="info-item-value" style={{ fontSize: 'var(--font-size-xs)' }}>
                          {reporte.localizacao.coordinates[1]?.toFixed(4)}, {reporte.localizacao.coordinates[0]?.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History */}
            {historico.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Histórico</h3>
                </div>
                <div className="card-body">
                  <div className="timeline">
                    {historico.map((h) => (
                      <div key={h._id} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>
                            {STATUS_LABELS[h.statusAnterior]} → {STATUS_LABELS[h.statusAtual]}
                          </div>
                          {h.observacao && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                              {h.observacao}
                            </div>
                          )}
                          <div className="timeline-date">
                            {h.mudadoPor?.nome} · {tempoRelativo(h.dataMudanca || h.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
