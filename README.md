# MCS Operaciones

## Database Schema (DDL)

```sql
-- 1. Tabela Principal de Incidências
create table if not exists incidencias (
  id bigint primary key generated always as identity,
  titulo text not null,
  descricao text,
  tipo text not null, -- Ex: 'Acidente', 'Falta', 'Qualidade', 'Reemplazo'
  
  -- Campos de Classificação PT
  prioridade text default 'Media', -- Mantido para legado
  impacto text not null default 'Médio', -- 'Baixo'|'Médio'|'Alto'|'Crítico'
  status text not null default 'Aberto', -- 'Aberto', 'Em Andamento', 'Resolvido', 'Fechado'
  
  -- Datas e Prazos
  data_abertura timestamptz default now(),
  data_fechamento timestamptz,
  prazo_estimado timestamptz,
  updated_at timestamptz default now(),

  -- Contexto de Criação
  origem_tipo text default 'Manual', -- 'Manual'|'Pedido'|'Sistema'
  origem_codigo text,
  origem_criacao text default 'automacao', -- 'manual'|'automacao'
  criado_por text, -- email/id user
  criado_por_nome text, -- display name
  
  -- Responsáveis
  responsavel_id uuid, 
  departamento_owner_id int,
  departamento_owner_nome text, -- Desnormalizado para facilidade
  
  cliente text, 
  empresa text,
  comercial text
);

-- 2. Tarefas
create table if not exists incidencia_tarefas (
  id bigint primary key generated always as identity,
  incidencia_id bigint references incidencias(id) on delete cascade,
  titulo text not null,
  status text default 'Pendente', -- 'Pendente', 'Concluida'
  ordem int default 0,
  departamento text,
  prazo timestamptz,
  evidencia text,
  responsavel_email text,
  updated_at timestamptz default now()
);

-- 3. Log
create table if not exists incidencia_log (
  id bigint primary key generated always as identity,
  incidencia_id bigint references incidencias(id) on delete cascade,
  mensagem text not null,
  criado_em timestamptz default now(),
  usuario text
);

-- 4. Playbooks (Automação)
create table if not exists playbooks (
  id uuid primary key default gen_random_uuid(),
  tipo text, -- Ex: 'Acidente' (sugestão de uso)
  nome text not null,
  ativo boolean default true,
  descricao text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists playbook_tarefas (
  id uuid primary key default gen_random_uuid(),
  playbook_id uuid references playbooks(id) on delete cascade,
  ordem int default 0,
  departamento text,
  titulo text not null,
  descricao text,
  sla_dias int default 1,
  created_at timestamptz default now()
);
```

## SQL Views (Otimização Frontend)

### 1. View Lista de Incidências (`v_incidencias_lista`)
Calcula progresso, SLA e agrega departamentos diretamente no banco.

```sql
create or replace view v_incidencias_lista as
select 
  i.*,
  -- Totais e Progresso
  (select count(*) from incidencia_tarefas t where t.incidencia_id = i.id) as tarefas_totais,
  (select count(*) from incidencia_tarefas t where t.incidencia_id = i.id and t.status = 'Concluida') as tarefas_concluidas,
  case 
    when (select count(*) from incidencia_tarefas t where t.incidencia_id = i.id) = 0 then 0
    else round(
      ((select count(*) from incidencia_tarefas t where t.incidencia_id = i.id and t.status = 'Concluida')::numeric / 
      (select count(*) from incidencia_tarefas t where t.incidencia_id = i.id)::numeric) * 100
    )
  end as progresso_pct,
  
  -- SLA: Baseado na tarefa aberta mais próxima de vencer, ou no prazo da incidência
  (
    select extract(day from (min(coalesce(t.prazo, i.prazo_estimado)) - now()))::int
    from incidencia_tarefas t 
    where t.incidencia_id = i.id and t.status = 'Pendente'
    union all
    select extract(day from (i.prazo_estimado - now()))::int -- Fallback se não houver tarefas
    limit 1
  ) as sla_dias,

  -- Departamentos Envolvidos (Array de Strings)
  -- Nota: array_agg requer que incidencia_tarefas.departamento não seja nulo
  array(
    select distinct departamento 
    from incidencia_tarefas t 
    where t.incidencia_id = i.id and t.departamento is not null
  ) as departamentos_envolvidos

from incidencias i;
```

### 2. View Minhas Tarefas (`v_tarefas_minha_fila`)
Traz dados da incidência pai para evitar joins no cliente.

```sql
create or replace view v_tarefas_minha_fila as
select 
  t.*,
  i.titulo as incidencia_titulo,
  i.impacto as incidencia_impacto,
  i.origem_codigo as origem_codigo,
  -- SLA da Tarefa
  case
    when t.prazo is null then 999
    else extract(day from (t.prazo - now()))::int
  end as sla_dias
from incidencia_tarefas t
join incidencias i on t.incidencia_id = i.id;
```