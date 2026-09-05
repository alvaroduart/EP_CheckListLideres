import { supabase } from '../config/supabase';
import { Setor } from '../types';
import { generateId } from '../utils/id';

function mapRow(row: any): Setor {
  return { id: row.id, nome: row.nome, ordem: row.ordem };
}

export async function listSetores(): Promise<Setor[]> {
  const { data, error } = await supabase.from('setores').select('*').order('ordem', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function criarSetor(nome: string): Promise<Setor> {
  const nomeTrim = nome.trim();
  if (!nomeTrim) throw new Error('Informe o nome do setor.');

  const { data: existentes, error: errExistente } = await supabase
    .from('setores')
    .select('id')
    .eq('nome', nomeTrim)
    .limit(1);
  if (errExistente) throw new Error(errExistente.message);
  if (existentes && existentes.length > 0) throw new Error('Já existe um setor com esse nome.');

  const { data: todos, error: errTodos } = await supabase.from('setores').select('ordem');
  if (errTodos) throw new Error(errTodos.message);
  const maxOrdem = (todos ?? []).reduce((max, s) => Math.max(max, s.ordem), 0);
  const id = generateId('SET');
  const ordem = maxOrdem + 1;

  const { error } = await supabase.from('setores').insert({ id, nome: nomeTrim, ordem });
  if (error) throw new Error(error.message);

  return { id, nome: nomeTrim, ordem };
}

export async function atualizarSetor(id: string, nome: string): Promise<Setor> {
  const nomeTrim = nome.trim();
  if (!nomeTrim) throw new Error('Informe o nome do setor.');

  const { data: duplicados, error: errDup } = await supabase
    .from('setores')
    .select('id')
    .eq('nome', nomeTrim)
    .neq('id', id)
    .limit(1);
  if (errDup) throw new Error(errDup.message);
  if (duplicados && duplicados.length > 0) throw new Error('Já existe um setor com esse nome.');

  const { data, error } = await supabase
    .from('setores')
    .update({ nome: nomeTrim })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function excluirSetor(id: string): Promise<void> {
  const { count, error: errCount } = await supabase
    .from('pessoas')
    .select('id', { count: 'exact', head: true })
    .eq('setor_id', id);
  if (errCount) throw new Error(errCount.message);
  if ((count ?? 0) > 0) {
    throw new Error('Não é possível excluir: existem pessoas cadastradas nesse setor.');
  }
  const { error } = await supabase.from('setores').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
