import { gql } from '@apollo/client';

/* ============================================
   Fragments
   Obs.: o backend popula `autor` e `categoria` só com alguns campos
   (ex.: 'nome email'), então pedimos apenas esses para não violar
   campos non-null do schema (createdAt!, perfil!, isAtivo!...).
   ============================================ */

export const REPORTE_CAMPOS = gql`
  fragment ReporteCampos on Reporte {
    id
    titulo
    descricao
    status
    endereco
    imagens
    createdAt
    updatedAt
    localizacao {
      type
      coordinates
    }
    categoria {
      id
      nome
    }
    autor {
      id
      nome
    }
  }
`;

/* ============================================
   Queries
   ============================================ */

export const GET_REPORTES = gql`
  ${REPORTE_CAMPOS}
  query Reportes($status: String, $categoria: ID, $pagina: Int, $limite: Int) {
    reportes(status: $status, categoria: $categoria, pagina: $pagina, limite: $limite) {
      reportes {
        ...ReporteCampos
      }
      paginacao {
        total
        pagina
        limite
        paginas
      }
    }
  }
`;

export const GET_REPORTE = gql`
  ${REPORTE_CAMPOS}
  query Reporte($id: ID!) {
    reporte(id: $id) {
      ...ReporteCampos
    }
  }
`;

export const GET_CATEGORIAS = gql`
  query Categorias {
    categorias {
      id
      nome
      descricao
      isAtivo
    }
  }
`;

export const GET_DASHBOARD = gql`
  query Dashboard($dias: Int) {
    estatisticasDashboard {
      total
      porStatus {
        _id
        quantidade
      }
    }
    reportesPorCategoria {
      categoria {
        _id
        nome
      }
      quantidade
    }
    reportesPorPeriodo(dias: $dias) {
      data
      quantidade
    }
  }
`;

/* ============================================
   Mutations
   ============================================ */

export const LOGIN = gql`
  mutation Login($email: String!, $senha: String!) {
    login(email: $email, senha: $senha) {
      token
      usuario {
        id
        nome
        email
        perfil
        ativo
      }
    }
  }
`;

export const REGISTRO = gql`
  mutation Registro($entrada: RegistroEntrada!) {
    registro(entrada: $entrada) {
      token
      usuario {
        id
        nome
        email
        perfil
        ativo
      }
    }
  }
`;

export const CRIAR_REPORTE = gql`
  mutation CriarReporte($entrada: CriarReporteEntrada!) {
    criarReporte(entrada: $entrada) {
      id
      titulo
      status
    }
  }
`;

export const ATUALIZAR_STATUS_REPORTE = gql`
  mutation AtualizarStatusReporte($id: ID!, $status: String!, $observacao: String) {
    atualizarStatusReporte(id: $id, status: $status, observacao: $observacao) {
      id
      status
      updatedAt
    }
  }
`;

export const ADICIONAR_COMENTARIO = gql`
  mutation AdicionarComentario($reporteId: ID!, $conteudo: String!) {
    adicionarComentario(reporteId: $reporteId, conteudo: $conteudo) {
      id
      reporte
      conteudo
      createdAt
      autor {
        id
        nome
      }
    }
  }
`;
