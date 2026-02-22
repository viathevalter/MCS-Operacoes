
export const pt = {
  menu: {
    dashboard: 'Dashboard',
    estimaciones: 'Estimativas',
    pedidos: 'Pedidos',
    operacao: 'Operação',
    minhas_tarefas: 'Minhas Tarefas',
    incidencias: 'Incidências',
    admin: 'Administração',
    playbooks: 'Playbooks',
    tarefas_modelo: 'Modelos de Tarefas',
    departamentos: 'Departamentos',
    funcionarios: 'Funcionários',
    main_menu: 'Menu Principal',
    daily_mgmt: 'Gestão Diária',
    version: 'v2.5.0 (Operações)'
  },
  dashboard: {
    title: 'Dashboard Diretoria',
    subtitle: 'Visão Consolidada',
    kpi: {
      pedidos: 'Pedidos',
      estimaciones: 'Orçamentos',
      firmados: 'Fechados',
      conv_pedido: 'Conv. Pedido',
      fill_rate: 'Taxa de Atend.'
    },
    charts: {
      performance: 'Performance Mensal (Stack)',
      profile_mix: 'Mix de Perfis (Demanda vs Oferta)',
      top_companies: 'Top Empresas',
      top_sales: 'Top Comerciais',
      top_clients: 'Top Clientes'
    },
    table: {
      profile: 'Perfil',
      demand: 'Demanda',
      supply: 'Oferta',
      gap: 'Gap'
    }
  },
  incidencias: {
    title: 'Central de Incidências',
    tabs: {
      resumo: 'Resumo Gerencial',
      lista: 'Lista de Incidências',
      fila: 'Fila de Tarefas'
    },
    btn_new: 'Nova Incidência',
    btn_quick_task: 'Nova Tarefa',
    btn_new_process: 'Iniciar Processo',
    filters: {
      search_placeholder: 'Buscar ID, título...',
      status_all: 'Status: Todos',
      impact_all: 'Impacto: Todos'
    },
    table: {
      id: 'ID',
      status: 'Status',
      titulo: 'Título / Cliente',
      criado_por: 'Criado Por',
      dept_impacto: 'Dept. Impacto',
      progresso: 'Progresso',
      tempo_restante: 'Tempo Restante'
    },
    status: {
      Aberto: 'Aberto',
      'Em Andamento': 'Em Andamento',
      Resolvido: 'Resolvido',
      Fechado: 'Fechado'
    },
    impacto: {
      Baixo: 'Baixo',
      Médio: 'Médio',
      Alto: 'Alto',
      Crítico: 'Crítico'
    },
    detail: {
      back: 'Voltar para Lista',
      open: 'Abertura',
      closed: 'Fechado',
      origin: 'Origem',
      client: 'Cliente',
      responsible: 'Responsável',
      checklist: 'Checklist & Tarefas',
      add_task: 'Adicionar',
      timeline: 'Timeline & Log',
      no_tasks: 'Nenhuma tarefa pendente.',
      no_logs: 'Nenhum registro ainda.',
      comment_placeholder: 'Adicionar comentário ou atualização...',
      save_task: 'Salvar Tarefa'
    },
    modal_nova_tarefa: {
      title_process: 'Iniciar Novo Processo',
      title_quick: 'Nova Tarefa Rápida',
      desc_quick: 'Cria uma ação imediata no quadro de tarefas, sem a complexidade de um processo completo.',
      context_label: 'CONTEXTO (VINCULAR A...)',
      context_general: 'Geral (Sem vínculo)',
      context_client: 'Cliente (Projetos, CS)',
      context_worker: 'Colaborador (RH, DP)',
      context_order: 'Pedido (Dpto. Técnico)',
      what_needs_to_be_done: 'O que precisa ser feito?',
      what_needs_to_be_done_placeholder: 'Ex: Ligar para Cliente X...',
      department: 'Departamento',
      priority: 'Prioridade',
      scheduled_for: 'Agendado Para',
      sla_deadline: 'Prazo (SLA)',
      additional_details: 'Detalhes Adicionais (Opcional)',
      additional_details_placeholder: 'Instruções...',
      btn_cancel: 'Cancelar',
      btn_create: 'Criar Incidência',
      search_client: 'Buscar Cliente',
      search_client_placeholder: 'Nome do cliente...',
      search_worker: 'Buscar Colaborador',
      search_worker_placeholder: 'Nome...',
      search_order: 'Buscar Pedido',
      search_order_placeholder: 'Código...',
      time_hours: 'Horas',
      time_days: 'Dias'
    }
  },
  tasks: {
    title: 'Gestão de Tarefas',
    subtitle: 'Acompanhe sua fila de trabalho.',
    tabs: {
      minhas: 'Minhas Tarefas',
      setor: 'Meu Setor',
      todas: 'Todas'
    },
    kpi: {
      pendentes: 'Minhas Pendentes',
      vencidas: 'Vencidas',
      hoje: 'Vencem Hoje'
    },
    table: {
      tarefa: 'Tarefa',
      contexto: 'Contexto',
      setor: 'Setor',
      prazo: 'Prazo',
      responsavel: 'Responsável',
      acao: 'Ação'
    },
    status: {
      Pendente: 'Pendente',
      'Em Andamento': 'Em Andamento',
      Concluida: 'Concluída'
    },
    actions: {
      assumir: 'Assumir',
      iniciar: 'Iniciar',
      concluir: 'Concluir',
      feito: 'Feito'
    },
    atrasado: 'ATRASADO',
    vencida_ha: 'Vencida há {{days}} dias',
    assigned_to: 'Atribuído a'
  },
  common: {
    loading: 'Carregando...',
    filters_global: 'Filtros Globais',
    period: 'Período',
    company: 'Empresa',
    all_companies: 'Todas as Empresas',
    not_assigned: 'Não atribuído',
    cancel: 'Cancelar',
    save: 'Salvar'
  }
};
