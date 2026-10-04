import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { isAutenticado } = useAuth();

  return (
    <div className="page">
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--space-16) var(--space-6)',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div className="fade-in">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-accent)',
            fontWeight: 600,
            marginBottom: 'var(--space-6)',
          }}>
            🚨 Plataforma de alertas urbanos
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-6)',
          }}>
            Sua cidade,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              sua voz
            </span>
          </h1>

          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto var(--space-8)',
          }}>
            Reporte buracos, postes apagados, vazamentos e outros problemas urbanos.
            Acompanhe a resolução em tempo real e ajude a melhorar sua cidade.
          </p>

          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {isAutenticado ? (
              <>
                <Link to="/reportes/novo" className="btn btn-primary btn-lg" id="btn-novo-reporte-hero">
                  📢 Criar Reporte
                </Link>
                <Link to="/reportes" className="btn btn-secondary btn-lg" id="btn-ver-reportes-hero">
                  Ver Reportes
                </Link>
              </>
            ) : (
              <>
                <Link to="/registro" className="btn btn-primary btn-lg" id="btn-registro-hero">
                  Comece Agora — É grátis
                </Link>
                <Link to="/reportes" className="btn btn-secondary btn-lg" id="btn-explorar-hero">
                  Explorar Reportes
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ paddingBottom: 'var(--space-16)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {[
            {
              icon: '📍',
              title: 'Geolocalização',
              desc: 'Marque a localização exata do problema no mapa para facilitar a resolução.',
            },
            {
              icon: '📷',
              title: 'Fotos e Evidências',
              desc: 'Envie imagens para documentar o problema e dar mais visibilidade.',
            },
            {
              icon: '🔔',
              title: 'Acompanhe em Tempo Real',
              desc: 'Receba atualizações sobre o status dos seus reportes e acompanhe a resolução.',
            },
            {
              icon: '💬',
              title: 'Comentários',
              desc: 'Comente nos reportes para adicionar informações e interagir com a comunidade.',
            },
            {
              icon: '📊',
              title: 'Dashboard Analítico',
              desc: 'Moderadores e admins acessam dashboards com estatísticas e análises.',
            },
            {
              icon: '📱',
              title: 'PWA — Funciona Offline',
              desc: 'Instale no celular e acesse a qualquer momento, mesmo sem internet.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="card slide-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <div className="card-body">
                <div style={{
                  fontSize: '2rem',
                  marginBottom: 'var(--space-4)',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 700,
                  marginBottom: 'var(--space-2)',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
