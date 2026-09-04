-- Checklist Diário de Liderança — Electro Plastic
-- Rode este script inteiro no Supabase: Project > SQL Editor > New query > Run.
-- Pode rodar de uma vez só; é seguro rodar novamente (usa "if not exists" onde possível).

-- ============================================================
-- TABELAS
-- ============================================================

create table if not exists categorias (
  id text primary key,
  nome text not null unique,
  icone text not null,
  cor text not null,
  cor_fundo text not null,
  ordem integer not null
);

create table if not exists perguntas (
  id text primary key,
  categoria_id text not null references categorias(id) on delete restrict,
  texto text not null,
  ativo boolean not null default true,
  ordem integer not null
);

create table if not exists checklists (
  id text primary key,
  data text not null,
  responsavel text not null,
  turno text not null,
  observacoes text not null default '',
  criado_em timestamptz not null default now()
);

create table if not exists respostas (
  id text primary key,
  checklist_id text not null references checklists(id) on delete cascade,
  pergunta_id text not null,
  categoria text not null,
  pergunta_texto text not null,
  resposta text not null,
  foto_uri text,
  ordem integer not null default 0
);

-- View com o resumo de cada checklist (usada na tela de Histórico)
create or replace view checklist_resumo as
select
  ch.id,
  ch.data,
  ch.responsavel,
  ch.turno,
  ch.observacoes,
  ch.criado_em,
  count(r.id) as total_perguntas,
  count(*) filter (where r.resposta = 'Sim') as total_sim,
  count(*) filter (where r.resposta = 'Não') as total_nao,
  count(*) filter (where r.foto_uri is not null) as total_fotos
from checklists ch
left join respostas r on r.checklist_id = ch.id
group by ch.id;

grant select on checklist_resumo to anon, authenticated;

-- ============================================================
-- SEGURANÇA (Row Level Security)
-- Ferramenta interna já protegida por senha no próprio app — liberamos
-- leitura/escrita para a "anon key" usada pelo cliente.
-- ============================================================

alter table categorias enable row level security;
alter table perguntas enable row level security;
alter table checklists enable row level security;
alter table respostas enable row level security;

drop policy if exists "allow all" on categorias;
create policy "allow all" on categorias for all using (true) with check (true);

drop policy if exists "allow all" on perguntas;
create policy "allow all" on perguntas for all using (true) with check (true);

drop policy if exists "allow all" on checklists;
create policy "allow all" on checklists for all using (true) with check (true);

drop policy if exists "allow all" on respostas;
create policy "allow all" on respostas for all using (true) with check (true);

-- ============================================================
-- ARMAZENAMENTO DE FOTOS
-- ============================================================

insert into storage.buckets (id, name, public)
values ('fotos-checklist', 'fotos-checklist', true)
on conflict (id) do nothing;

drop policy if exists "fotos checklist select" on storage.objects;
create policy "fotos checklist select" on storage.objects
  for select using (bucket_id = 'fotos-checklist');

drop policy if exists "fotos checklist insert" on storage.objects;
create policy "fotos checklist insert" on storage.objects
  for insert with check (bucket_id = 'fotos-checklist');

drop policy if exists "fotos checklist delete" on storage.objects;
create policy "fotos checklist delete" on storage.objects
  for delete using (bucket_id = 'fotos-checklist');

-- ============================================================
-- DADOS INICIAIS (categorias e perguntas padrão do briefing)
-- Só insere se a tabela categorias estiver vazia.
-- ============================================================

do $$
begin
  if not exists (select 1 from categorias) then

    insert into categorias (id, nome, icone, cor, cor_fundo, ordem) values
      ('CAT-5S', '5''S', 'broom', '#1E8A5F', '#E4F5EC', 1),
      ('CAT-SEG', 'Segurança', 'shield-check-outline', '#C17A00', '#FCF1DC', 2),
      ('CAT-NR12', 'NR12', 'cog-outline', '#B03A2E', '#FBE7E4', 3);

    insert into perguntas (id, categoria_id, texto, ativo, ordem) values
      ('Q-5S-1', 'CAT-5S', 'Área da Máquina Limpa?', true, 1),
      ('Q-5S-2', 'CAT-5S', 'Existe aparas/refiles espalhados pelo setor? (Sem ser o que está na máquina)', true, 2),
      ('Q-5S-3', 'CAT-5S', 'Ferramentas estão organizadas?', true, 3),
      ('Q-5S-4', 'CAT-5S', 'Materiais estão identificados e nos locais corretos?', true, 4),
      ('Q-5S-5', 'CAT-5S', 'Bobinas nos locais demarcados?', true, 5),
      ('Q-5S-6', 'CAT-5S', 'Corredores e áreas de circulação livres?', true, 6),
      ('Q-5S-7', 'CAT-5S', 'Bancadas limpas e organizadas?', true, 7),
      ('Q-5S-8', 'CAT-5S', 'Existe material desnecessário na área?', true, 8),
      ('Q-SEG-1', 'CAT-SEG', 'Colaboradores utilizando EPIs obrigatórios?', true, 1),
      ('Q-SEG-2', 'CAT-SEG', 'Calçado de segurança adequado?', true, 2),
      ('Q-SEG-3', 'CAT-SEG', 'Toucas utilizadas corretamente?', true, 3),
      ('Q-SEG-4', 'CAT-SEG', 'Há uso de adornos próximo às máquinas?', true, 4),
      ('Q-NR12-1', 'CAT-NR12', 'As proteções estão quebradas ou danificadas?', true, 1),
      ('Q-NR12-2', 'CAT-NR12', 'Botão de emergência está acessível?', true, 2),
      ('Q-NR12-3', 'CAT-NR12', 'Sensores de segurança estão funcionando?', true, 3),
      ('Q-NR12-4', 'CAT-NR12', 'As áreas de corte e solda estão devidamente protegidas?', true, 4);

  end if;
end $$;
