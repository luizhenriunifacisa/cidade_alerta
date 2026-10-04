import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

/**
 * Endpoint GraphQL do backend (Apollo Server montado em /graphql no app.js).
 * Em dev, o Vite faz proxy de /graphql → http://localhost:3000/graphql.
 */
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || '/graphql';

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

/**
 * Injeta o JWT no header Authorization — o backend lê `Bearer <token>`
 * no `context` do expressMiddleware para popular `contexto.usuario`.
 */
const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

/**
 * Loga erros e trata sessão expirada (resolvers lançam "Não autenticado").
 */
const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, path }) => {
      console.warn(`[GraphQL] ${message}${path ? ` (em ${path.join('.')})` : ''}`);
      if (message.startsWith('Não autenticado') && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:expirado'));
      }
    });
  } else if (error) {
    console.warn(`[Rede] ${error.message}`);
  }
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // Tipos de agregação não possuem identidade própria → não normalizar
      ContagemPorStatus: { keyFields: false },
      ContagemPorCategoria: { keyFields: false },
      ContagemPorPeriodo: { keyFields: false },
      CategoriaContagem: { keyFields: false },
      PaginacaoInfo: { keyFields: false },
      Localizacao: { keyFields: false },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
