import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { authApi } from '../services/api';
import { LOGIN, REGISTRO } from '../graphql/operations';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const client = useApolloClient();
  const [loginMutation] = useMutation(LOGIN);
  const [registroMutation] = useMutation(REGISTRO);

  const carregarPerfil = useCallback(async () => {
    if (!token) {
      setCarregando(false);
      return;
    }

    try {
      const data = await authApi.perfil();
      setUsuario(data.data.usuario);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  const iniciarSessao = async ({ token: novoToken, usuario: novoUsuario }) => {
    localStorage.setItem('token', novoToken);
    setToken(novoToken);
    setUsuario(novoUsuario);
    // Refaz as queries ativas com o novo token (ex.: dados dependentes do usuário)
    await client.resetStore().catch(() => {});
  };

  // Mutation GraphQL: login(email, senha) → AuthPayload { token, usuario }
  const login = async (email, senha) => {
    const { data } = await loginMutation({ variables: { email, senha } });
    await iniciarSessao(data.login);
    return data.login;
  };

  // Mutation GraphQL: registro(entrada: RegistroEntrada!) → AuthPayload
  const registro = async (nome, email, senha) => {
    const { data } = await registroMutation({
      variables: { entrada: { nome, email, senha } },
    });
    await iniciarSessao(data.registro);
    return data.registro;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
    client.clearStore();
  }, [client]);

  // Disparado pelo errorLink do Apollo quando o backend responde "Não autenticado"
  useEffect(() => {
    window.addEventListener('auth:expirado', logout);
    return () => window.removeEventListener('auth:expirado', logout);
  }, [logout]);

  const isAdmin = usuario?.perfil === 'admin';
  const isModerador = usuario?.perfil === 'moderador' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        carregando,
        login,
        registro,
        logout,
        isAdmin,
        isModerador,
        isAutenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
