const typeDefs = `#graphql

  scalar Upload

  type Usuario {
    id: ID!
    nome: String!
    email: String!
    perfil: String!
    ativo: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Categoria {
    id: ID!
    nome: String!
    descricao: String
    isAtivo: Boolean!
  }

  type Localizacao {
    type: String
    coordinates: [Float]!
  }

  type Reporte {
    id: ID!
    titulo: String!
    descricao: String!
    categoria: Categoria
    autor: Usuario
    status: String!
    localizacao: Localizacao
    endereco: String
    imagens: [String]
    createdAt: String!
    updatedAt: String!
  }

  type Comentario {
    id: ID!
    reporte: ID!
    autor: Usuario
    conteudo: String!
    createdAt: String!
  }

  type StatusHistorico {
    id: ID!
    reporte: ID!
    statusAnterior: String!
    statusAtual: String!
    mudadoPor: Usuario
    observacao: String
    dataMudanca: String!
  }

  type ContagemPorStatus {
    _id: String!
    quantidade: Int!
  }

  type CategoriaContagem {
    _id: ID
    nome: String
  }

  type ContagemPorCategoria {
    categoria: CategoriaContagem
    quantidade: Int!
  }

  type ContagemPorPeriodo {
    data: String!
    quantidade: Int!
  }

  type EstatisticasDashboard {
    total: Int!
    porStatus: [ContagemPorStatus]!
  }

  type AuthPayload {
    token: String!
    usuario: Usuario!
  }

  type PaginacaoInfo {
    total: Int!
    pagina: Int!
    limite: Int!
    paginas: Int!
  }

  type ReportesComPaginacao {
    reportes: [Reporte]!
    paginacao: PaginacaoInfo!
  }

  input RegistroEntrada {
    nome: String!
    email: String!
    senha: String!
  }

  input LocalizacaoEntrada {
    type: String
    coordinates: [Float]!
  }

  input CriarReporteEntrada {
    titulo: String!
    descricao: String!
    categoria: ID!
    localizacao: LocalizacaoEntrada!
    endereco: String
    imagens: [Upload]
  }

  type Query {
    me: Usuario
    usuarios: [Usuario]!
    usuario(id: ID!): Usuario
    reportes(status: String, categoria: ID, pagina: Int, limite: Int): ReportesComPaginacao!
    meusReportes(pagina: Int, limite: Int): ReportesComPaginacao!
    reporte(id: ID!): Reporte
    categorias: [Categoria]!
    categoria(id: ID!): Categoria
    comentarios(reporteId: ID!): [Comentario]!
    historicoStatus(reporteId: ID!): [StatusHistorico]!
    estatisticasDashboard: EstatisticasDashboard!
    reportesPorCategoria: [ContagemPorCategoria]!
    reportesPorStatus: [ContagemPorStatus]!
    reportesPorPeriodo(dias: Int): [ContagemPorPeriodo]!
  }

  type Mutation {
    registro(entrada: RegistroEntrada!): AuthPayload!
    login(email: String!, senha: String!): AuthPayload!
    
    criarReporte(entrada: CriarReporteEntrada!): Reporte!
    atualizarReporte(id: ID!, titulo: String, descricao: String, categoria: ID, endereco: String): Reporte!
    deletarReporte(id: ID!): Boolean!
    atualizarStatusReporte(id: ID!, status: String!, observacao: String): Reporte!
    
    adicionarComentario(reporteId: ID!, conteudo: String!): Comentario!
    
    criarCategoria(nome: String!, descricao: String): Categoria!
    atualizarCategoria(id: ID!, nome: String, descricao: String, isAtivo: Boolean): Categoria!
    deletarCategoria(id: ID!): Boolean!
    
    atualizarUsuario(id: ID!, nome: String, perfil: String, ativo: Boolean): Usuario!
    deletarUsuario(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
