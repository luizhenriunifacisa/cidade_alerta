# CidadeAlerta — Backend API
API REST + GraphQL para o sistema de alertas urbanos, onde cidadãos podem reportar problemas na cidade e acompanhar a resolução.

## Tecnologias
- Node.js + Express 5 — servidor HTTP
- MongoDB + Mongoose — banco de dados
- Apollo Server + GraphQL — API GraphQL
- JWT (jsonwebtoken) — autenticação
- bcryptjs — hash de senhas
- express-validator — validação de dados

## Como Rodar
- Node.js 18 ou versão superior
- MongoDB rodando localmente ou MongoDB Atlas

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz:
```
PORT=3000
MONGODB_URI=mongodb_uri
JWT_SECRET=chave_secreta
```

### 3. Iniciar o servidor
```bash
# Desenvolvimento
npm run dev

O servidor estará disponível em:
- API REST: http://localhost:3000/api
- GraphQL: http://localhost:3000/graphql

## Endpoints da API REST

### Auth
POST `/api/auth/registro` - Registrar novo usuário 
POST `/api/auth/login` - Fazer login e receber token 
GET `/api/auth/perfil` - Ver perfil do usuário logado 

### Usuários
GET `/api/usuarios` - admin - Listar todos os usuários 
GET `/api/usuarios/:id` - admin - Detalhes de um usuário 
PUT `/api/usuarios/:id` - próprio/admin - Atualizar nome/email 
PATCH `/api/usuarios/:id/papel` - admin - Alterar perfil(cidadao/moderador/admin) 
PATCH `/api/usuarios/:id/status` - admin - Ativar/desativar conta 

### Categorias
GET `/api/categorias` - Listar categorias ativas 
GET `/api/categorias/:id` - Detalhes de uma categoria 
POST `/api/categorias` - admin - Criar categoria 
PUT `/api/categorias/:id` - admin - Atualizar categoria 
DELETE `/api/categorias/:id` - admin - Deletar categoria 

### Reportes
GET `/api/reportes` - Listar com filtros e paginação 
GET `/api/reportes/meus` - Reportes do usuário logado 
GET `/api/reportes/:id` - Detalhes de um reporte 
GET `/api/reportes/:id/historico` - Histórico de mudanças de status 
POST `/api/reportes` - Criar reporte 
PUT `/api/reportes/:id` - autor - Editar reporte 
PATCH `/api/reportes/:id/status` - admin/moderador - Alterar status 
DELETE `/api/reportes/:id` - admin - Deletar reporte 

### Comentários
POST `/api/reportes/:id/comentarios` - Adicionar comentário 
GET `/api/reportes/:id/comentarios` - Listar comentários 
DELETE `/api/comentarios/:id` - Deletar (autor ou admin) 

### Dashboard
GET `/api/dashboard/estatisticas` - admin/moderador - Contagem por status 
GET `/api/dashboard/por-categoria`- admin/moderador - Contagem por categoria 
GET `/api/dashboard/por-periodo?dias=30` - admin/moderador - Reportes por dia 

---

## GraphQL

Acesse o Apollo Sandbox em http://localhost:3000/graphql para testar.

### Queries

# Listar reportes com filtros e paginação
query {
  reportes(status: "aberto", pagina: 1, limite: 5) {
    reportes {
      id
      titulo
      status
      categoria { nome }
      autor { nome }
    }
    paginacao {
      total
      paginas
    }
  }
}

# Estatísticas do dashboard
query {
  estatisticasDashboard {
    total
    porStatus { _id quantidade }
  }
}

# Categorias
query {
  categorias {
    id
    nome
    icone
  }
}


### Mutations

# Registrar
mutation {
  registro(input: { nome: "Novo User", email: "novo@email.com", senha: "123456" }) {
    token
    usuario { id nome email perfil }
  }
}

# Login
mutation {
  login(email: "joao@email.com", senha: "joao123") {
    token
    usuario { id nome perfil }
  }
}

# Criar reporte (requer token no header Authorization: Bearer <token>)
mutation {
  criarReporte(input: {
    titulo: "Problema teste"
    descricao: "Descrição do problema encontrado"
    categoria: "id_da_categoria"
    localizacao: { coordenadas: [-43.17, -22.90] }
  }) {
    id
    titulo
    status
  }
}

# Adicionar comentário (requer token)
mutation {
  adicionarComentario(reporteId: "id_do_reporte", conteudo: "Meu comentário") {
    id
    conteudo
    autor { nome }
  }
}

Para mutations que requerem autenticação, envie o token JWT no header do postman:
```
Authorization: Bearer seu_token_aqui
```

---
## Scripts

npm run dev - Inicia com nodemon
npm start - Inicia em produção 
