import { supabase } from '../config/supabase';
import { MetricaCategoria, MetricaGlobal, MetricaPergunta, MetricaSetor } from '../types';

export async function getMetricasGlobais(): Promise<MetricaGlobal> {
  const { data, error } = await supabase.from('metricas_globais').select('*').single();
  if (error) throw new Error(error.message);
  return {
    totalChecklists: data.total_checklists ?? 0,
    totalRespostas: data.total_respostas ?? 0,
    totalSim: data.total_sim ?? 0,
    totalNao: data.total_nao ?? 0,
  };
}

export async function listMetricasCategoria(): Promise<MetricaCategoria[]> {
  const { data, error } = await supabase.from('metricas_categoria').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    categoriaNome: row.categoria_nome,
    total: row.total,
    totalSim: row.total_sim,
    totalNao: row.total_nao,
  }));
}

export async function listMetricasSetor(): Promise<MetricaSetor[]> {
  const { data, error } = await supabase.from('metricas_setor').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    setorId: row.setor_id,
    setorNome: row.setor_nome,
    total: row.total,
    totalSim: row.total_sim,
    totalNao: row.total_nao,
  }));
}

export async function listMetricasPergunta(): Promise<MetricaPergunta[]> {
  const { data, error } = await supabase.from('metricas_pergunta').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    perguntaId: row.pergunta_id,
    perguntaTexto: row.pergunta_texto,
    categoria: row.categoria,
    total: row.total,
    totalSim: row.total_sim,
    totalNao: row.total_nao,
  }));
}
