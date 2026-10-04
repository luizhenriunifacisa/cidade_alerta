import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { reportesApi } from '../services/api';
import { GET_CATEGORIAS, GET_REPORTE, CRIAR_REPORTE } from '../graphql/operations';
import { useToast } from '../contexts/ToastContext';
import { extrairGpsDoExif } from '../utils/exif';
import { getId } from '../utils/helpers';

export default function ReporteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdicao = !!id;
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const client = useApolloClient();

  const [salvando, setSalvando] = useState(false);
  const [extraindoGps, setExtraindoGps] = useState(false);

  // Arquivos selecionados para upload (File objects)
  const [arquivos, setArquivos] = useState([]);
  // Preview URLs das imagens selecionadas
  const [previews, setPreviews] = useState([]);
  // Imagens já salvas no servidor (em edição)
  const [imagensExistentes, setImagensExistentes] = useState([]);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    endereco: '',
    latitude: '',
    longitude: '',
  });

  // Query GraphQL: categorias
  const { data: dataCategorias } = useQuery(GET_CATEGORIAS);
  const categorias = dataCategorias?.categorias || [];

  // Query GraphQL: reporte(id) — apenas no modo edição
  const { data: dataReporte, loading: carregandoReporte, error: erroReporte } = useQuery(GET_REPORTE, {
    variables: { id },
    skip: !isEdicao,
    fetchPolicy: 'network-only',
  });
  const carregando = isEdicao && carregandoReporte && !dataReporte;

  // Mutation GraphQL: criarReporte
  const [criarReporteMutation] = useMutation(CRIAR_REPORTE);

  useEffect(() => {
    if (!isEdicao) return;
    if (erroReporte || (dataReporte && !dataReporte.reporte)) {
      toast.error('Reporte não encontrado.');
      navigate('/reportes');
      return;
    }
    const r = dataReporte?.reporte;
    if (!r) return;
    setForm({
      titulo: r.titulo || '',
      descricao: r.descricao || '',
      categoria: getId(r.categoria) || '',
      endereco: r.endereco || '',
      latitude: r.localizacao?.coordinates?.[1]?.toString() || '',
      longitude: r.localizacao?.coordinates?.[0]?.toString() || '',
    });
    setImagensExistentes(r.imagens || []);
  }, [isEdicao, dataReporte, erroReporte]);

  // Limpar previews ao desmontar
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Processa arquivos selecionados:
   * - Gera previews
   * - Tenta extrair GPS do EXIF da primeira foto (se ainda não tem coordenadas)
   */
  const processarArquivos = async (novosArquivos) => {
    if (novosArquivos.length === 0) return;

    const todosArquivos = [...arquivos, ...novosArquivos].slice(0, 5);
    setArquivos(todosArquivos);

    // Gerar previews
    const novosPreviews = todosArquivos.map((f) => URL.createObjectURL(f));
    // Revogar previews antigos
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(novosPreviews);

    // Tentar extrair GPS do EXIF da primeira imagem (se não tem coordenadas preenchidas)
    if (!form.latitude || !form.longitude) {
      setExtraindoGps(true);
      for (const arquivo of novosArquivos) {
        try {
          const gps = await extrairGpsDoExif(arquivo);
          if (gps) {
            setForm((prev) => ({
              ...prev,
              latitude: gps.latitude.toFixed(6),
              longitude: gps.longitude.toFixed(6),
            }));
            toast.success('📍 Localização extraída automaticamente da foto!');
            break;
          }
        } catch {
          // silencioso
        }
      }
      setExtraindoGps(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processarArquivos(files);
    }
    e.target.value = ''; // Reset para permitir selecionar o mesmo arquivo
  };

  const removerArquivo = (index) => {
    const novosArquivos = arquivos.filter((_, i) => i !== index);
    setArquivos(novosArquivos);

    URL.revokeObjectURL(previews[index]);
    setPreviews(novosArquivos.map((f) => URL.createObjectURL(f)));
  };

  const removerImagemExistente = (index) => {
    setImagensExistentes((prev) => prev.filter((_, i) => i !== index));
  };

  const obterLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada neste navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success('📍 Localização obtida pelo GPS do dispositivo!');
      },
      (err) => {
        if (err.code === 1) {
          toast.error('Permissão de localização negada. Ative nas configurações.');
        } else {
          toast.error('Não foi possível obter a localização.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo || form.titulo.length < 5) {
      toast.error('O título deve ter no mínimo 5 caracteres.');
      return;
    }

    if (!form.descricao || form.descricao.length < 10) {
      toast.error('A descrição deve ter no mínimo 10 caracteres.');
      return;
    }

    if (!form.categoria) {
      toast.error('Selecione uma categoria.');
      return;
    }

    if (!form.latitude || !form.longitude) {
      toast.error('Informe a localização — tire uma foto com GPS ativo ou use o botão de localização.');
      return;
    }

    setSalvando(true);
    try {
      const dados = {
        titulo: form.titulo,
        descricao: form.descricao,
        categoria: form.categoria,
        endereco: form.endereco,
        localizacao: {
          type: 'Point',
          coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)],
        },
      };

      if (isEdicao) {
        // A API REST continua aqui para o update caso a API GraphQL não suporte imagens no update
        dados.imagens = imagensExistentes;
        await reportesApi.atualizar(id, dados);
        await client.refetchQueries({ include: [GET_REPORTE] });
        toast.success('Reporte atualizado com sucesso!');
        navigate(`/reportes/${id}`);
      } else {
        // Criação 100% via GraphQL (agora com suporte ao scalar Upload)
        const { data } = await criarReporteMutation({
          variables: { entrada: { ...dados, endereco: dados.endereco || null, imagens: arquivos } },
        });
        toast.success('Reporte criado com sucesso! 🎉');
        navigate(`/reportes/${data.criarReporte.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar reporte.');
    } finally {
      setSalvando(false);
    }
  };

  const totalImagens = arquivos.length + imagensExistentes.length;
  const podeAdicionarMais = totalImagens < 5;
  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  if (carregando) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <span className="loading-text">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '720px' }}>
        <div className="page-header">
          <h1 className="page-title">
            {isEdicao ? '✏️ Editar Reporte' : '📢 Novo Reporte'}
          </h1>
          <p className="page-subtitle">
            {isEdicao
              ? 'Atualize as informações do reporte'
              : 'Tire uma foto do problema, adicione uma descrição e envie'}
          </p>
        </div>

        <div className="card fade-in">
          <div className="card-body">
            <form onSubmit={handleSubmit} id="reporte-form">

              {/* ========== FOTOS ========== */}
              <div className="form-group">
                <label className="form-label">
                  📷 Fotos do problema {!isEdicao && '*'}{' '}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                    ({totalImagens}/5)
                  </span>
                </label>

                <p style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-3)',
                  lineHeight: 1.5,
                }}>
                  💡 Tire uma foto com o GPS do celular ativo — a localização será extraída automaticamente da imagem.
                </p>

                {/* Botões de adicionar foto */}
                {podeAdicionarMais && (
                  <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                    {/* Câmera (mobile) */}
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => cameraInputRef.current?.click()}
                      id="btn-camera"
                      style={{ flex: '1', minWidth: '140px' }}
                    >
                      📸 Tirar Foto
                    </button>

                    {/* Galeria */}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      id="btn-galeria"
                      style={{ flex: '1', minWidth: '140px' }}
                    >
                      🖼️ Escolher da Galeria
                    </button>

                    {/* Input de câmera (oculto) — capture="environment" abre câmera traseira */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      capture="environment"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id="input-camera"
                    />

                    {/* Input de galeria (oculto) — aceita múltiplos */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id="input-galeria"
                    />
                  </div>
                )}

                {/* Indicador de extração GPS */}
                {extraindoGps && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-3)',
                    background: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-accent)',
                    marginBottom: 'var(--space-3)',
                  }}>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Extraindo localização da foto...
                  </div>
                )}

                {/* Preview das imagens existentes (edição) */}
                {imagensExistentes.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-3)',
                  }}>
                    {imagensExistentes.map((img, i) => (
                      <div key={`existing-${i}`} style={{ position: 'relative' }}>
                        <img
                          src={img.startsWith('http') ? img : `${API_URL}${img}`}
                          alt={`Imagem ${i + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removerImagemExistente(i)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'var(--color-danger)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview dos novos arquivos */}
                {previews.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 'var(--space-3)',
                  }}>
                    {previews.map((url, i) => (
                      <div key={`new-${i}`} style={{ position: 'relative' }}>
                        <img
                          src={url}
                          alt={`Nova imagem ${i + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid var(--color-accent)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removerArquivo(i)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'var(--color-danger)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          ✕
                        </button>
                        {i === 0 && (
                          <span style={{
                            position: 'absolute',
                            bottom: 4,
                            left: 4,
                            background: 'var(--color-accent)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                          }}>
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {totalImagens === 0 && !isEdicao && (
                  <div
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-10) var(--space-6)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      background: 'var(--color-bg-input)',
                    }}
                    id="dropzone"
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)', opacity: 0.5 }}>📷</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      Toque para tirar uma foto do problema
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                      JPEG ou PNG · máx 5MB por imagem · até 5 fotos
                    </div>
                  </div>
                )}
              </div>

              {/* ========== TÍTULO ========== */}
              <div className="form-group">
                <label className="form-label" htmlFor="titulo">
                  Título *
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Buraco na Rua das Flores"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  minLength={5}
                />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Mín. 5 caracteres
                </span>
              </div>

              {/* ========== DESCRIÇÃO ========== */}
              <div className="form-group">
                <label className="form-label" htmlFor="descricao">
                  Descrição *
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  className="form-textarea"
                  placeholder="Descreva o problema com detalhes. Ex: Buraco de aproximadamente 50cm de diâmetro na calçada, próximo ao poste 123..."
                  value={form.descricao}
                  onChange={handleChange}
                  rows={5}
                  required
                  minLength={10}
                />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Mín. 10 caracteres
                </span>
              </div>

              {/* ========== CATEGORIA ========== */}
              <div className="form-group">
                <label className="form-label" htmlFor="categoria">
                  Categoria *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  className="form-select"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* ========== ENDEREÇO ========== */}
              <div className="form-group">
                <label className="form-label" htmlFor="endereco">
                  Endereço <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(opcional)</span>
                </label>
                <input
                  id="endereco"
                  name="endereco"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  value={form.endereco}
                  onChange={handleChange}
                />
              </div>

              {/* ========== LOCALIZAÇÃO ========== */}
              <div className="form-group">
                <label className="form-label">
                  📍 Localização *
                </label>

                {form.latitude && form.longitude ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-3)',
                  }}>
                    <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-lg)' }}>✓</span>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#34d399' }}>
                        Localização definida
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        Lat: {form.latitude}, Lng: {form.longitude}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setForm((prev) => ({ ...prev, latitude: '', longitude: '' }))}
                      style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)' }}
                    >
                      Limpar
                    </button>
                  </div>
                ) : (
                  <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-3)',
                    fontSize: 'var(--font-size-sm)',
                    color: '#fbbf24',
                  }}>
                    ⚠️ Localização ainda não definida. Tire uma foto com GPS ativo ou use o botão abaixo.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={obterLocalizacao}
                    id="btn-geolocalizacao"
                  >
                    📍 Usar GPS do dispositivo
                  </button>
                </div>

                {/* Campos manuais (colapsáveis) */}
                <details style={{ marginTop: 'var(--space-3)' }}>
                  <summary style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}>
                    Inserir coordenadas manualmente
                  </summary>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="Latitude (ex: -22.9068)"
                      value={form.latitude}
                      onChange={handleChange}
                      id="input-latitude"
                    />
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="Longitude (ex: -43.1729)"
                      value={form.longitude}
                      onChange={handleChange}
                      id="input-longitude"
                    />
                  </div>
                </details>
              </div>

              {/* ========== AÇÕES ========== */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={salvando}
                  id="btn-salvar-reporte"
                >
                  {salvando
                    ? '⏳ Enviando...'
                    : isEdicao
                      ? '💾 Atualizar Reporte'
                      : '📢 Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
