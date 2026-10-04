import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportesApi } from '../services/api';
import { STATUS_LABELS, tempoRelativo } from '../utils/helpers';

export default function MeusReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    reportesApi.meus().then((res) => {
      setReportes(res.data.reportes);
    }).catch(() => {
      setReportes([]);
    }).finally(() => setCarregando(false));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header page-header-actions">
          <div>
            <h1 className="page-title">Meus Reportes</h1>
            <p className="page-subtitle">{reportes.length} reportes criados por você</p>
          </div>
          <Link to="/reportes/novo" className="btn btn-primary" id="btn-novo-reporte">
            + Novo Reporte
          </Link>
        </div>

        {carregando ? (
          <div className="loading-container">
            <div className="spinner" />
            <span className="loading-text">Carregando...</span>
          </div>
        ) : reportes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">Nenhum reporte ainda</h3>
            <p className="empty-state-text">Você ainda não criou nenhum reporte.</p>
            <Link to="/reportes/novo" className="btn btn-primary">
              Criar primeiro reporte
            </Link>
          </div>
        ) : (
          <div className="reports-grid">
            {reportes.map((reporte, i) => (
              <Link
                key={reporte._id}
                to={`/reportes/${reporte._id}`}
                className="report-card slide-up"
                style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards', textDecoration: 'none', color: 'inherit' }}
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
                    <span className="report-card-meta-item">
                      🕐 {tempoRelativo(reporte.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
