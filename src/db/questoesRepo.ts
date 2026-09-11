import { supabase } from '../config/supabase';
import { Questao } from '../types';
import { generateId } from '../utils/id';

const SELECT = '*, categorias(nome, ordem), setores(nome)';

function mapRow(row: any): Questao {
  return {
    id: row.id,
    categoriaId: row.categoria_id,
    categoria: row.categorias?.nome ?? '',
    setorId: row.setor_id,
    setorNome: row.setores?.nome ?? null,
    pergunta: row.texto,
    ativo: row.ativo,
    ordem: row.ordem,
  };
}

function sortByCategoriaEOrdem(rows: any[]): any[] {
  return [...rows].sort((a, b) => {
    const catOrdemA = a.categorias?.ordem ?? 0;
    const catOrdemB = b.categorias?.ordem ?? 0;
    if (catOrdemA !== catOrdemB) return catOrdemA - catOrdemB;
    return a.ordem - b.ordem;
  });
}

// Perguntas sem setor_id (cadastradas antes dessa coluna existir) aparecem
// para todos os setores; as demais só aparecem para o setor selecionado.
export async function listQuestoesAtivas(setorId: string): Promise<Questao[]> {
  const { data, error } = await supabase
    .from('perguntas')
    .select(SELECT)
    .eq('ativo', true)
    .or(`setor_id.eq.${setorId},setor_id.is.null`);
  if (error) throw new Error(error.message);
  return sortByCategoriaEOrdem(data ?? []).map(mapRow);
}

export async function listTodasQuestoes(): Promise<Questao[]> {
  const { data, error } = await supabase.from('perguntas').select(SELECT);
  if (error) throw new Error(error.message);
  return sortByCategoriaEOrdem(data ?? []).map(mapRow);
}

export async function criarQuestao(categoriaId: string, setorId: string, texto: string): Promise<Questao> {
  const textoTrim = texto.trim();
  if (!textoTrim) throw new Error('Informe o texto da pergunta.');

  const { data: categoria, error: errCat } = await supabase
    .from('categorias')
    .select('nome')
    .eq('id', categoriaId)
    .maybeSingle();
  if (errCat) throw new Error(errCat.message);
  if (!categoria) throw new Error('Categoria não encontrada.');

  const { data: setor, error: errSetor } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', setorId)
    .maybeSingle();
  if (errSetor) throw new Error(errSetor.message);
  if (!setor) throw new Error('Setor não encontrado.');

  const { data: existentes, error: errOrdem } = await supabase
    .from('perguntas')
    .select('ordem')
    .eq('categoria_id', categoriaId);
  if (errOrdem) throw new Error(errOrdem.message);
  const maxOrdem = (existentes ?? []).reduce((max, p) => Math.max(max, p.ordem), 0);
  const id = generateId('Q');
  const ordem = maxOrdem + 1;

  const { error } = await supabase.from('perguntas').insert({
    id,
    categoria_id: categoriaId,
    setor_id: setorId,
    texto: textoTrim,
    ativo: true,
    ordem,
  });
  if (error) throw new Error(error.message);

  return {
    id,
    categoriaId,
    categoria: categoria.nome,
    setorId,
    setorNome: setor.nome,
    pergunta: textoTrim,
    ativo: true,
    ordem,
  };
}

export async function atualizarQuestao(
  id: string,
  categoriaId: string,
  setorId: string,
  texto: string
): Promise<Questao> {
  const textoTrim = texto.trim();
  if (!textoTrim) throw new Error('Informe o texto da pergunta.');

  const { error } = await supabase
    .from('perguntas')
    .update({ categoria_id: categoriaId, setor_id: setorId, texto: textoTrim })
    .eq('id', id);
  if (error) throw new Error(error.message);

  const { data, error: errFetch } = await supabase
    .from('perguntas')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (errFetch) throw new Error(errFetch.message);
  return mapRow(data);
}

export async function alternarAtivoQuestao(id: string, ativo: boolean): Promise<Questao> {
  const { error } = await supabase.from('perguntas').update({ ativo }).eq('id', id);
  if (error) throw new Error(error.message);

  const { data, error: errFetch } = await supabase
    .from('perguntas')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (errFetch) throw new Error(errFetch.message);
  return mapRow(data);
}

export async function excluirQuestao(id: string): Promise<void> {
  const { error } = await supabase.from('perguntas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
