export const STATUS_LABELS = {
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

export const STATUS_LIST = ['aberto', 'em_andamento', 'resolvido', 'fechado'];

export const PERFIL_LABELS = {
  cidadao: 'Cidadão',
  moderador: 'Moderador',
  admin: 'Administrador',
};

/**
 * Converte datas vindas da API em Date.
 * - REST retorna ISO string ("2026-10-01T12:00:00.000Z")
 * - GraphQL (scalar String) serializa o Date do Mongoose como timestamp em ms ("1727800000000")
 */
export function parseData(valor) {
  if (valor instanceof Date) return valor;
  if (typeof valor === 'number') return new Date(valor);
  if (typeof valor === 'string' && /^\d+$/.test(valor)) return new Date(Number(valor));
  return new Date(valor);
}

/** Normaliza o id (GraphQL usa `id`, REST usa `_id`) */
export const getId = (obj) => obj?.id || obj?._id;

export function formatarData(dataStr) {
  if (!dataStr) return '—';
  const data = parseData(dataStr);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatarDataHora(dataStr) {
  if (!dataStr) return '—';
  const data = parseData(dataStr);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function tempoRelativo(dataStr) {
  if (!dataStr) return '';
  const agora = new Date();
  const data = parseData(dataStr);
  const diffMs = agora - data;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  if (diffDias < 30) return `${diffDias}d atrás`;
  return formatarData(dataStr);
}

export function getIniciais(nome) {
  if (!nome) return '?';
  return nome
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
