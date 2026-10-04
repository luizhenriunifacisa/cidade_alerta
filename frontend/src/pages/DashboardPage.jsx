import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD } from '../graphql/operations';
import { STATUS_LABELS } from '../utils/helpers';

const STATUS_COLORS = {
  aberto: '#3b82f6',
  em_andamento: '#f59e0b',
  resolvido: '#10b981',
  fechado: '#6b7280',
};

const STATUS_ICONS = {
  aberto: '📂',
  em_andamento: '⚙️',
  resolvido: '✅',
  fechado: '🔒',
};

export default function DashboardPage() {
  const [dias, setDias] = useState(30);

  // Uma única requisição GraphQL busca os 3 conjuntos de dados do dashboard
  const { data, loading } = useQuery(GET_DASHBOARD, { variables: { dias } });

  const estatisticas = data?.estatisticasDashboard;
  const porCategoria = data?.reportesPorCategoria || [];
  const porPeriodo = data?.reportesPorPeriodo || [];
  const carregando = loading && !data;

  const getQuantidadePorStatus = (status) => {
    if (!estatisticas?.porStatus) return 0;
    const item = estatisticas.porStatus.find((s) => s._id === status);
    return item?.quantidade || 0;
  };

  const maxCategoria = Math.max(...porCategoria.map((c) => c.quantidade), 1);
  const maxPeriodo = Math.max(...porPeriodo.map((p) => p.quantidade), 1);

  if (carregando) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <span className="loading-text">Carregando dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 Dashboard</h1>
          <p className="page-subtitle">Visão geral dos alertas urbanos</p>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          <div className="stat-card fade-in" style={{ '--stat-color': 'var(--color-accent)' }}>
            <div className="stat-card-icon">📊</div>
            <div className="stat-card-value">{estatisticas?.total || 0}</div>
            <div className="stat-card-label">Total de Reportes</div>
          </div>

          {Object.entries(STATUS_LABELS).map(([key, label], i) => (
            <div
              key={key}
              className="stat-card fade-in"
              style={{
                '--stat-color': STATUS_COLORS[key],
                animationDelay: `${(i + 1) * 0.1}s`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="stat-card-icon" style={{
                background: `${STATUS_COLORS[key]}15`,
                color: STATUS_COLORS[key],
              }}>
                {STATUS_ICONS[key]}
              </div>
              <div className="stat-card-value">{getQuantidadePorStatus(key)}</div>
              <div className="stat-card-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
          {/* By Category */}
          <div className="chart-container fade-in">
            <h3 className="chart-title">Reportes por Categoria</h3>
            {porCategoria.length === 0 ? (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Sem dados disponíveis.
              </p>
            ) : (
              <div className="chart-bar-group">
                {porCategoria.map((item, i) => (
                  <div key={i} className="chart-bar-item">
                    <span className="chart-bar-label">{item.categoria?.nome || 'N/A'}</span>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{
                          width: `${Math.max((item.quantidade / maxCategoria) * 100, 8)}%`,
                          background: `linear-gradient(90deg, var(--color-accent), #fb923c)`,
                        }}
                      >
                        {item.quantidade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Period */}
          <div className="chart-container fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <h3 className="chart-title" style={{ marginBottom: 0 }}>Reportes por Período</h3>
              <select
                className="form-select"
                value={dias}
                onChange={(e) => setDias(parseInt(e.target.value))}
                style={{ width: 'auto', padding: 'var(--space-1) var(--space-6) var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                id="select-periodo"
              >
                <option value={7}>7 dias</option>
                <option value={14}>14 dias</option>
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </select>
            </div>

            {porPeriodo.length === 0 ? (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Sem dados no período selecionado.
              </p>
            ) : (
              <div className="chart-bar-group">
                {porPeriodo.slice(-10).map((item, i) => (
                  <div key={i} className="chart-bar-item">
                    <span className="chart-bar-label">
                      {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{
                          width: `${Math.max((item.quantidade / maxPeriodo) * 100, 8)}%`,
                          background: `linear-gradient(90deg, #3b82f6, #6366f1)`,
                        }}
                      >
                        {item.quantidade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
