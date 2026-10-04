import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_REPORTES, GET_CATEGORIAS } from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_LABELS, STATUS_LIST, tempoRelativo } from '../utils/helpers';

export default function ReportesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAutenticado } = useAuth();

  const statusFiltro = searchParams.get('status') || '';
  const categoriaFiltro = searchParams.get('categoria') || '';
  const paginaAtual = parseInt(searchParams.get('pagina')) || 1;

  // Query GraphQL: categorias
  const { data: dataCategorias } = useQuery(GET_CATEGORIAS);
  const categorias = dataCategorias?.categorias || [];

  // Query GraphQL: reportes(status, categoria, pagina, limite)
  const { data, loading, error } = useQuery(GET_REPORTES, {
    variables: {
      pagina: paginaAtual,
      limite: 10,
      status: statusFiltro || undefined,
      categoria: categoriaFiltro || undefined,
    },
  });

  const reportes = error ? [] : data?.reportes?.reportes || [];
  const paginacao = data?.reportes?.paginacao || { total: 0, pagina: 1, paginas: 1 };
  const carregando = loading && !data;

  const aplicarFiltro = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('pagina');
    setSearchParams(params);
  };

  const irParaPagina = (pagina) => {
    const params = new URLSearchParams(searchParams);
    params.set('pagina', pagina);
    setSearchParams(params);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header page-header-actions">
          <div>
            <h1 className="page-title">Reportes</h1>
            <p className="page-subtitle">
              {paginacao.total} {paginacao.total === 1 ? 'reporte encontrado' : 'reportes encontrados'}
            </p>
          </div>
          {isAutenticado && (
            <Link to="/reportes/novo" className="btn btn-primary" id="btn-novo-reporte">
              + Novo Reporte
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="filters-bar" id="filters-bar">
          <button
            className={`filter-chip ${!statusFiltro ? 'active' : ''}`}
            onClick={() => aplicarFiltro('status', '')}
          >
            Todos
          </button>
          {STATUS_LIST.map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFiltro === s ? 'active' : ''}`}
              onClick={() => aplicarFiltro('status', s)}
            >
              <span className={`badge-dot ${s}`} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: `var(--color-status-${s.replace('_', '-')})`,
              }} />
              {STATUS_LABELS[s]}
            </button>
          ))}

          {categorias.length > 0 && (
            <select
              className="form-select"
              value={categoriaFiltro}
              onChange={(e) => aplicarFiltro('categoria', e.target.value)}
              style={{ maxWidth: '200px', padding: 'var(--space-2) var(--space-8) var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)' }}
              id="filter-categoria"
            >
              <option value="">Todas categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Content */}
        {carregando ? (
          <div className="loading-container">
            <div className="spinner" />
            <span className="loading-text">Carregando reportes...</span>
          </div>
        ) : reportes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">Nenhum reporte encontrado</h3>
            <p className="empty-state-text">
              {statusFiltro || categoriaFiltro
                ? 'Tente ajustar os filtros.'
                : 'Seja o primeiro a reportar um problema!'}
            </p>
            {isAutenticado && !statusFiltro && !categoriaFiltro && (
              <Link to="/reportes/novo" className="btn btn-primary">
                Criar primeiro reporte
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="reports-grid">
              {reportes.map((reporte, i) => (
                <Link
                  key={reporte.id}
                  to={`/reportes/${reporte.id}`}
                  className="report-card slide-up"
                  style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards', textDecoration: 'none', color: 'inherit' }}
                  id={`report-card-${reporte.id}`}
                >
                  <div className={`report-card-indicator ${reporte.status}`} />
                  <div className="report-card-content">
                    <div className="report-card-header">
                      <h3 className="report-card-title">{reporte.titulo}</h3>
                      <span className={`badge badge-${reporte.status}`}>
                        <span className="badge-dot" />
                        {STATUS_LABELS[reporte.status]}
                      </span>
                    </div>
                    <p className="report-card-desc">{reporte.descricao}</p>
                    <div className="report-card-meta">
                      {reporte.categoria && (
                        <span className="report-card-meta-item">
                          🏷️ {reporte.categoria.nome}
                        </span>
                      )}
                      {reporte.autor && (
                        <span className="report-card-meta-item">
                          👤 {reporte.autor.nome}
                        </span>
                      )}
                      <span className="report-card-meta-item">
                        🕐 {tempoRelativo(reporte.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {paginacao.paginas > 1 && (
              <div className="pagination" id="pagination">
                <button
                  className="pagination-btn"
                  disabled={paginaAtual <= 1}
                  onClick={() => irParaPagina(paginaAtual - 1)}
                >
                  ‹
                </button>
                {Array.from({ length: paginacao.paginas }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${p === paginaAtual ? 'active' : ''}`}
                    onClick={() => irParaPagina(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={paginaAtual >= paginacao.paginas}
                  onClick={() => irParaPagina(paginaAtual + 1)}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
