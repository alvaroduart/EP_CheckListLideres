import { supabase } from '../config/supabase';
import { Pessoa } from '../types';
import { generateId } from '../utils/id';

const SELECT = '*, setores(nome)';

function mapRow(row: any): Pessoa {
  return {
    id: row.id,
    nome: row.nome,
    setorId: row.setor_id,
    setorNome: row.setores?.nome ?? '',
    pushToken: row.push_token,
  };
}

export async function listPessoas(): Promise<Pessoa[]> {
  const { data, error } = await supabase.from('pessoas').select(SELECT).order('nome', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function criarPessoa(nome: string, setorId: string): Promise<Pessoa> {
  const nomeTrim = nome.trim();
  if (!nomeTrim) throw new Error('Informe seu nome.');
  if (!setorId) throw new Error('Selecione seu setor.');

  const { data: setor, error: errSetor } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', setorId)
    .maybeSingle();
  if (errSetor) throw new Error(errSetor.message);
  if (!setor) throw new Error('Setor não encontrado.');

  const id = generateId('P');
  const { error } = await supabase.from('pessoas').insert({ id, nome: nomeTrim, setor_id: setorId });
  if (error) throw new Error(error.message);

  return { id, nome: nomeTrim, setorId, setorNome: setor.nome, pushToken: null };
}

export async function atualizarPushToken(pessoaId: string, pushToken: string): Promise<void> {
  const { error } = await supabase.from('pessoas').update({ push_token: pushToken }).eq('id', pessoaId);
  if (error) throw new Error(error.message);
}
