import { useState, useEffect } from 'react';
import { categoriasApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import * as Lucide from 'lucide-react';

export default function CategoriasAdminPage() {

  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const toast = useToast();
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () =>{

    setCarregando(true);

    try {
      const res = await categoriasApi.listar();
      setCategorias(res.data?.categorias || res.data || []);
    }
    catch {
      setCategorias([]);
    }
    finally {
      setCarregando(false);
    }
  };

  const abrirForm = (categoria = null) =>{

    if(categoria) {
      setEditando(categoria);
      setNome(categoria.nome);
      setDescricao(categoria.descricao || '');
    }
    else {
      setEditando(null);
      setNome('');
      setDescricao('');
    }
    setFormAberto(true);
  };

  const fecharForm = () =>{
    setFormAberto(false);
    setEditando(null);
    setNome('');
    setDescricao('');
  };

  const salvar = async (e) => {
    e.preventDefault();

    if(!nome.trim()) {
      toast.error('Nome é obrigatório.');
      return;
    }

    setSalvando(true);

    try {
      if(editando) {
        await categoriasApi.atualizar(editando._id, { nome, descricao });
        toast.success('Categoria atualizada!');
      }
      else {
        await categoriasApi.criar({ nome, descricao });
        toast.success('Categoria criada!');
      }
      fecharForm();
      carregarCategorias();
    }
    catch(err) {
      toast.error(err.message || 'Erro ao salvar categoria.');
    }
    finally {
      setSalvando(false);
    }
  };

  const deletar = async (id) =>{

    if(!window.confirm('Tem certeza?')) {
      return;
    }

    try {
      await categoriasApi.deletar(id);
      toast.success('Categoria removida');
      carregarCategorias();
    }
    catch(err) {
      toast.error(err.message || 'Erro ao deletar.');
    }
  };

  return (
      <div className="page">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="page-header page-header-actions">
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lucide.Tag size={28} /> Categorias
              </h1>
              <p className="page-subtitle">Gerencie as categorias de reportes</p>
            </div>
            <button
                className="btn btn-primary"
                onClick={() => abrirForm()}
                id="btn-nova-categoria"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Lucide.Plus size={18} /> Nova Categoria
            </button>
          </div>

          {formAberto && (
              <div className="modal-overlay" onClick={fecharForm}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="modal-title">
                      {editando ? 'Editar Categoria' : 'Nova Categoria'}
                    </h2>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={fecharForm}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                    >
                      <Lucide.X size={18} />
                    </button>
                  </div>
                  <form onSubmit={salvar}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label className="form-label" htmlFor="cat-nome">Nome</label>
                        <input
                            id="cat-nome"
                            className="form-input"
                            placeholder="Nome da categoria"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cat-descricao">Descrição</label>
                        <textarea
                            id="cat-descricao"
                            className="form-textarea"
                            placeholder="Descrição opcional"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            rows={3}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={fecharForm}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={salvando} id="btn-salvar-categoria">
                        {salvando ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          )}

          {carregando ? (
              <div className="loading-container">
                <div className="spinner" />
                <span className="loading-text">Carregando...</span>
              </div>
          ) : categorias.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Lucide.Tag size={48} color="var(--color-text-muted)" />
                </div>
                <h3 className="empty-state-title">Nenhuma categoria</h3>
                <p className="empty-state-text">Crie a primeira categoria para os reportes.</p>
              </div>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {categorias.map((cat, i) => (
                    <div
                        key={cat._id}
                        className="card slide-up"
                        style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards' }}
                    >
                      <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-6)' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '2px' }}>{cat.nome}</div>
                          {cat.descricao && (
                              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                {cat.descricao}
                              </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => abrirForm(cat)}
                              title="Editar"
                          >
                            <Lucide.Pencil size={16} />
                          </button>
                          <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => deletar(cat._id)}
                              style={{ color: 'var(--color-danger)' }}
                              title="Excluir"
                          >
                            <Lucide.Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );

}
