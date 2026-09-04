import { supabase } from '../config/supabase';
import { CATEGORY_COLOR_PALETTE } from '../theme/theme';
import { Categoria, CategoriaIcone } from '../types';
import { generateId } from '../utils/id';

function mapRow(row: any): Categoria {
  return {
    id: row.id,
    nome: row.nome,
    icone: row.icone,
    cor: row.cor,
    corFundo: row.cor_fundo,
    ordem: row.ordem,
  };
}

export async function listCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function criarCategoria(nome: string, icone: CategoriaIcone): Promise<Categoria> {
  const nomeTrim = nome.trim();
  if (!nomeTrim) throw new Error('Informe o nome da categoria.');

  const { data: existentes, error: errExistente } = await supabase
    .from('categorias')
    .select('id')
    .eq('nome', nomeTrim)
    .limit(1);
  if (errExistente) throw new Error(errExistente.message);
  if (existentes && existentes.length > 0) throw new Error('Já existe uma categoria com esse nome.');

  const { data: todas, error: errTodas } = await supabase.from('categorias').select('ordem');
  if (errTodas) throw new Error(errTodas.message);
  const total = todas?.length ?? 0;
  const maxOrdem = (todas ?? []).reduce((max, c) => Math.max(max, c.ordem), 0);
  const palette = CATEGORY_COLOR_PALETTE[total % CATEGORY_COLOR_PALETTE.length];
  const id = generateId('CAT');
  const ordem = maxOrdem + 1;

  const { error } = await supabase.from('categorias').insert({
    id,
    nome: nomeTrim,
    icone,
    cor: palette.cor,
    cor_fundo: palette.corFundo,
    ordem,
  });
  if (error) throw new Error(error.message);

  return { id, nome: nomeTrim, icone, cor: palette.cor, corFundo: palette.corFundo, ordem };
}

export async function atualizarCategoria(
  id: string,
  nome: string,
  icone: CategoriaIcone
): Promise<Categoria> {
  const nomeTrim = nome.trim();
  if (!nomeTrim) throw new Error('Informe o nome da categoria.');

  const { data: duplicadas, error: errDup } = await supabase
    .from('categorias')
    .select('id')
    .eq('nome', nomeTrim)
    .neq('id', id)
    .limit(1);
  if (errDup) throw new Error(errDup.message);
  if (duplicadas && duplicadas.length > 0) throw new Error('Já existe uma categoria com esse nome.');

  const { data, error } = await supabase
    .from('categorias')
    .update({ nome: nomeTrim, icone })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function excluirCategoria(id: string): Promise<void> {
  const { count, error: errCount } = await supabase
    .from('perguntas')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', id);
  if (errCount) throw new Error(errCount.message);
  if ((count ?? 0) > 0) {
    throw new Error(
      'Não é possível excluir: existem perguntas cadastradas nesta categoria. Exclua ou mova as perguntas primeiro.'
    );
  }
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
