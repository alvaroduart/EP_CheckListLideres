import { supabase } from '../config/supabase';
import { Notificacao, NotificacaoTipo } from '../types';
import { generateId } from '../utils/id';

function mapRow(row: any): Notificacao {
  return {
    id: row.id,
    destinatarioId: row.destinatario_id,
    tipo: row.tipo,
    titulo: row.titulo,
    mensagem: row.mensagem,
    checklistId: row.checklist_id,
    perguntaId: row.pergunta_id,
    lida: row.lida,
    criadoEm: row.criado_em,
  };
}

export async function listNotificacoes(pessoaId: string): Promise<Notificacao[]> {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('destinatario_id', pessoaId)
    .order('criado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function contarNaoLidas(pessoaId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notificacoes')
    .select('id', { count: 'exact', head: true })
    .eq('destinatario_id', pessoaId)
    .eq('lida', false);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function marcarComoLida(id: string): Promise<void> {
  const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function marcarTodasComoLidas(pessoaId: string): Promise<void> {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('destinatario_id', pessoaId)
    .eq('lida', false);
  if (error) throw new Error(error.message);
}

interface CriarNotificacaoInput {
  destinatarioId: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  checklistId?: string;
  perguntaId?: string;
}

export async function criarNotificacoes(itens: CriarNotificacaoInput[]): Promise<void> {
  if (itens.length === 0) return;
  const rows = itens.map((item) => ({
    id: generateId('N'),
    destinatario_id: item.destinatarioId,
    tipo: item.tipo,
    titulo: item.titulo,
    mensagem: item.mensagem,
    checklist_id: item.checklistId ?? null,
    pergunta_id: item.perguntaId ?? null,
  }));
  const { error } = await supabase.from('notificacoes').insert(rows);
  if (error) throw new Error(error.message);
}
