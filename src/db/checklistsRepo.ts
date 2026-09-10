import { supabase } from '../config/supabase';
import { ChecklistDetalhe, ChecklistPayload, ChecklistRegistro, RespostaChecklist } from '../types';
import { generateId } from '../utils/id';
import { criarNotificacoes } from './notificacoesRepo';
import { enviarPushEmMassa } from '../utils/pushNotifications';

function mapRegistro(row: any): ChecklistRegistro {
  return {
    id: row.id,
    data: row.data,
    responsavel: row.responsavel,
    turno: row.turno,
    observacoes: row.observacoes,
    criadoEm: row.criado_em,
    totalPerguntas: row.total_perguntas ?? 0,
    totalSim: row.total_sim ?? 0,
    totalNao: row.total_nao ?? 0,
    totalFotos: row.total_fotos ?? 0,
  };
}

function mapResposta(row: any): RespostaChecklist {
  return {
    perguntaId: row.pergunta_id,
    categoria: row.categoria,
    pergunta: row.pergunta_texto,
    resposta: row.resposta,
    fotoUri: row.foto_uri,
    comentario: row.comentario,
    atribuidoAId: row.atribuido_a_id,
    atribuidoANome: row.atribuido_a_nome,
  };
}

export async function salvarChecklist(payload: ChecklistPayload): Promise<void> {
  const { error: errChecklist } = await supabase.from('checklists').insert({
    id: payload.checklistId,
    data: payload.data,
    responsavel: payload.responsavel,
    turno: payload.turno,
    observacoes: payload.observacoes,
  });
  if (errChecklist) throw new Error(errChecklist.message);

  const respostasRows = payload.respostas.map((r, index) => ({
    id: generateId('R'),
    checklist_id: payload.checklistId,
    pergunta_id: r.perguntaId,
    categoria: r.categoria,
    pergunta_texto: r.pergunta,
    resposta: r.resposta,
    foto_uri: r.fotoUri ?? null,
    comentario: r.comentario ?? null,
    atribuido_a_id: r.atribuidoAId ?? null,
    atribuido_a_nome: r.atribuidoANome ?? null,
    ordem: index,
  }));
  const { error: errRespostas } = await supabase.from('respostas').insert(respostasRows);
  if (errRespostas) throw new Error(errRespostas.message);

  await notificarEnvolvidos(payload);
}

async function notificarEnvolvidos(payload: ChecklistPayload): Promise<void> {
  try {
    const { data: pessoas, error } = await supabase.from('pessoas').select('id, push_token');
    if (error || !pessoas) return;

    const tokenPorPessoa = new Map<string, string | null>(pessoas.map((p: any) => [p.id, p.push_token]));

    const notificacoes: Parameters<typeof criarNotificacoes>[0] = [];
    const pushes: Parameters<typeof enviarPushEmMassa>[0] = [];

    const itensAtribuidos = payload.respostas.filter((r) => r.resposta === 'Não' && r.atribuidoAId);
    if (itensAtribuidos.length > 0) {
      const tarefasRows = itensAtribuidos.map((item) => ({
        id: generateId('T'),
        checklist_id: payload.checklistId,
        pergunta_id: item.perguntaId,
        categoria: item.categoria,
        pergunta_texto: item.pergunta,
        comentario: item.comentario ?? null,
        foto_uri: item.fotoUri ?? null,
        atribuido_por_id: payload.responsavelId,
        atribuido_por_nome: payload.responsavel,
        atribuido_a_id: item.atribuidoAId,
        atribuido_a_nome: item.atribuidoANome,
        status: 'pendente',
      }));
      const { data: tarefasCriadas, error: errTarefas } = await supabase
        .from('tarefas')
        .insert(tarefasRows)
        .select();
      if (errTarefas) throw errTarefas;

      for (const tarefa of tarefasCriadas ?? []) {
        notificacoes.push({
          destinatarioId: tarefa.atribuido_a_id,
          tipo: 'tarefa',
          titulo: 'Nova tarefa atribuída',
          mensagem: `${payload.responsavel} marcou "Não" em "${tarefa.pergunta_texto}" e atribuiu essa tarefa a você.`,
          checklistId: payload.checklistId,
          perguntaId: tarefa.pergunta_id,
          tarefaId: tarefa.id,
        });
        const token = tokenPorPessoa.get(tarefa.atribuido_a_id);
        if (token) {
          pushes.push({
            pushToken: token,
            titulo: 'Nova tarefa atribuída',
            mensagem: `${payload.responsavel} atribuiu uma tarefa a você: "${tarefa.pergunta_texto}"`,
            data: { tarefaId: tarefa.id },
          });
        }
      }
    }

    for (const [pessoaId, token] of tokenPorPessoa) {
      if (pessoaId === payload.responsavelId) continue;
      notificacoes.push({
        destinatarioId: pessoaId,
        tipo: 'checklist_finalizado',
        titulo: 'Checklist finalizado',
        mensagem: `${payload.responsavel} finalizou o checklist de ${payload.data} (${payload.turno}).`,
        checklistId: payload.checklistId,
      });
      if (token) {
        pushes.push({
          pushToken: token,
          titulo: 'Checklist finalizado',
          mensagem: `${payload.responsavel} finalizou o checklist de ${payload.data} (${payload.turno}).`,
          data: { checklistId: payload.checklistId },
        });
      }
    }

    await criarNotificacoes(notificacoes);
    await enviarPushEmMassa(pushes);
  } catch {
    // notificações não devem impedir o checklist de ser salvo com sucesso
  }
}

export async function listChecklists(): Promise<ChecklistRegistro[]> {
  const { data, error } = await supabase
    .from('checklist_resumo')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRegistro);
}

export async function getChecklistDetalhe(id: string): Promise<ChecklistDetalhe> {
  const { data: registro, error: errRegistro } = await supabase
    .from('checklist_resumo')
    .select('*')
    .eq('id', id)
    .single();
  if (errRegistro) throw new Error(errRegistro.message);

  const { data: respostas, error: errRespostas } = await supabase
    .from('respostas')
    .select('*')
    .eq('checklist_id', id)
    .order('ordem', { ascending: true });
  if (errRespostas) throw new Error(errRespostas.message);

  return {
    ...mapRegistro(registro),
    respostas: (respostas ?? []).map(mapResposta),
  };
}

export async function excluirChecklist(id: string): Promise<void> {
  const { error } = await supabase.from('checklists').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
