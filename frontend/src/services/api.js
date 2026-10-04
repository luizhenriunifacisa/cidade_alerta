/**
 * Cliente REST — usado APENAS para operações que não existem no schema GraphQL
 * do backend (src/graphql/typeDefs.js). Todo o resto é consumido via Apollo Client
 * (veja src/graphql/operations.js).
 *
 * Operações que permanecem REST:
 *  - Perfil do usuário logado           (não há query `me`)
 *  - Criar reporte COM fotos             (não há scalar Upload — multer/multipart)
 *  - Editar / deletar reporte            (não há mutations)
 *  - Meus reportes                       (não há query)
 *  - Listar comentários / histórico      (não há queries)
 *  - CRUD de categorias (admin)          (só existem queries de leitura)
 *  - Gestão de usuários (admin)          (não há queries/mutations)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = (isJson = true) => {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }
  return data;
};

const request = (path, { method = 'GET', body } = {}) =>
  fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(handleResponse);

/* ============================================
   Auth (login/registro → GraphQL)
   ============================================ */

export const authApi = {
  perfil: () => request('/auth/perfil'),
};

/* ============================================
   Reportes (listar/obter/status/comentar → GraphQL)
   ============================================ */

export const reportesApi = {
  // Backend usa /reportes/autenticado (não /reportes/meus)
  meus: () => request('/reportes/autenticado'),

  /**
   * Criar reporte com upload de imagens via FormData (multipart/form-data)
   * O backend espera: titulo, descricao, categoria, localizacao, endereco, imagens (files)
   */
  criar: async (dados, arquivos = []) => {
    const formData = new FormData();
    formData.append('titulo', dados.titulo);
    formData.append('descricao', dados.descricao);
    formData.append('categoria', dados.categoria);
    formData.append('localizacao[type]', 'Point');
    formData.append('localizacao[coordinates][]', dados.localizacao.coordinates[0]);
    formData.append('localizacao[coordinates][]', dados.localizacao.coordinates[1]);

    if (dados.endereco) {
      formData.append('endereco', dados.endereco);
    }

    // Anexar arquivos de imagem (até 5)
    arquivos.forEach((arquivo) => {
      formData.append('imagens', arquivo);
    });

    const res = await fetch(`${API_BASE}/reportes`, {
      method: 'POST',
      headers: getHeaders(false), // Sem Content-Type — o browser define multipart/form-data com boundary
      body: formData,
    });
    return handleResponse(res);
  },

  atualizar: (id, dados) => request(`/reportes/${id}`, { method: 'PUT', body: dados }),
  deletar: (id) => request(`/reportes/${id}`, { method: 'DELETE' }),
  historico: (id) => request(`/reportes/${id}/historico`),
  comentarios: (id) => request(`/reportes/${id}/comentarios`),
};

/* ============================================
   Categorias — CRUD admin (listagem pública → GraphQL)
   ============================================ */

export const categoriasApi = {
  // Admin precisa ver também as inativas (a query GraphQL filtra isAtivo: true)
  listar: () => request('/categorias'),
  criar: (dados) => request('/categorias', { method: 'POST', body: dados }),
  atualizar: (id, dados) => request(`/categorias/${id}`, { method: 'PUT', body: dados }),
  deletar: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
};

/* ============================================
   Usuários (admin)
   ============================================ */

export const usuariosApi = {
  listar: () => request('/usuarios'),
  alterarPapel: (id, perfil) => request(`/usuarios/${id}/papel`, { method: 'PATCH', body: { perfil } }),
  alterarStatus: (id, ativo) => request(`/usuarios/${id}/status`, { method: 'PATCH', body: { ativo } }),
};
