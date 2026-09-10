import { supabase } from '../config/supabase';
import { Tarefa, TarefaStatus } from '../types';
import { generateId } from '../utils/id';
import { criarNotificacoes } from './notificacoesRepo';
import { enviarPushEmMassa } from '../utils/pushNotifications';

function mapRow(row: any): Tarefa {
  return {
    id: row.id,
    checklistId: row.checklist_id,
    perguntaId: row.pergunta_id,
    categoria: row.categoria,
    perguntaTexto: row.pergunta_texto,
    comentario: row.comentario,
    fotoUri: row.foto_uri,
    atribuidoPorId: row.atribuido_por_id,
    atribuidoPorNome: row.atribuido_por_nome,
    atribuidoAId: row.atribuido_a_id,
    atribuidoANome: row.atribuido_a_nome,
    status: row.status,
    dataConclusaoPrevista: row.data_conclusao_prevista,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export const STATUS_LABEL: Record<TarefaStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
};

export async function getTarefa(id: string): Promise<Tarefa> {
  const { data, error } = await supabase.from('tarefas').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function excluirTarefa(id: string): Promise<void> {
  const { error } = await supabase.from('tarefas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listTodasTarefas(): Promise<Tarefa[]> {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function atualizarTarefa(
  id: string,
  patch: { status?: TarefaStatus; dataConclusaoPrevista?: string | null }
): Promise<Tarefa> {
  const { data, error } = await supabase
    .from('tarefas')
    .update({
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.dataConclusaoPrevista !== undefined
        ? { data_conclusao_prevista: patch.dataConclusaoPrevista }
        : {}),
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  const tarefa = mapRow(data);

  await notificarAtualizacao(tarefa).catch(() => {});

  return tarefa;
}

async function notificarAtualizacao(tarefa: Tarefa): Promise<void> {
  const { data: pessoa } = await supabase
    .from('pessoas')
    .select('push_token')
    .eq('id', tarefa.atribuidoPorId)
    .maybeSingle();

  const statusLabel = STATUS_LABEL[tarefa.status];
  const mensagem = `${tarefa.atribuidoANome} atualizou a tarefa "${tarefa.perguntaTexto ?? ''}" para "${statusLabel}".`;

  await criarNotificacoes([
    {
      destinatarioId: tarefa.atribuidoPorId,
      tipo: 'tarefa_atualizada',
      titulo: 'Tarefa atualizada',
      mensagem,
      checklistId: tarefa.checklistId ?? undefined,
      perguntaId: tarefa.perguntaId ?? undefined,
      tarefaId: tarefa.id,
    },
  ]);

  if (pessoa?.push_token) {
    await enviarPushEmMassa([
      {
        pushToken: pessoa.push_token,
        titulo: 'Tarefa atualizada',
        mensagem,
        data: { tarefaId: tarefa.id },
      },
    ]);
  }
}
