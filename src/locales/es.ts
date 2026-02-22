
export const es = {
  menu: {
    dashboard: 'Tablero',
    estimaciones: 'Estimaciones',
    pedidos: 'Pedidos',
    operacao: 'Operación',
    minhas_tarefas: 'Mis Tareas',
    incidencias: 'Incidencias',
    admin: 'Administración',
    playbooks: 'Playbooks',
    tarefas_modelo: 'Tareas Modelo',
    main_menu: 'Menú Principal',
    daily_mgmt: 'Gestión Diaria',
    version: 'v2.5.0 (Operaciones)'
  },
  dashboard: {
    title: 'Tablero Directivo',
    subtitle: 'Visión Consolidada',
    kpi: {
      pedidos: 'Pedidos',
      estimaciones: 'Estimaciones',
      firmados: 'Cerrados',
      conv_pedido: 'Conv. Pedido',
      fill_rate: 'Tasa de Atenc.'
    },
    charts: {
      performance: 'Rendimiento Mensual (Stack)',
      profile_mix: 'Mix de Perfiles (Demanda vs Oferta)',
      top_companies: 'Top Empresas',
      top_sales: 'Top Comerciales',
      top_clients: 'Top Clientes'
    },
    table: {
      profile: 'Perfil',
      demand: 'Demanda',
      supply: 'Oferta',
      gap: 'Brecha'
    }
  },
  incidencias: {
    title: 'Central de Incidencias',
    tabs: {
      resumo: 'Resumen Gerencial',
      lista: 'Lista de Incidencias',
      fila: 'Cola de Tareas'
    },
    btn_new: 'Nueva Incidencia',
    btn_quick_task: 'Nueva Tarea',
    btn_new_process: 'Iniciar Proceso',
    filters: {
      search_placeholder: 'Buscar ID, título...',
      status_all: 'Estado: Todos',
      impact_all: 'Impacto: Todos'
    },
    table: {
      id: 'ID',
      status: 'Estado',
      titulo: 'Título / Cliente',
      criado_por: 'Creado Por',
      dept_impacto: 'Depto. Impacto',
      progresso: 'Progreso',
      tempo_restante: 'Tiempo Restante'
    },
    status: {
      Aberto: 'Abierto',
      'Em Andamento': 'En Curso',
      Resolvido: 'Resuelto',
      Fechado: 'Cerrado'
    },
    impacto: {
      Baixo: 'Bajo',
      Médio: 'Medio',
      Alto: 'Alto',
      Crítico: 'Crítico'
    },
    detail: {
      back: 'Volver a la Lista',
      open: 'Apertura',
      closed: 'Cerrado',
      origin: 'Origen',
      client: 'Cliente',
      responsible: 'Responsable',
      checklist: 'Checklist y Tareas',
      add_task: 'Agregar',
      timeline: 'Cronología y Log',
      no_tasks: 'No hay tareas pendientes.',
      no_logs: 'Ningún registro todavía.',
      comment_placeholder: 'Agregar comentario o actualización...',
      save_task: 'Guardar Tarea'
    },
    modal_nova_tarefa: {
      title_process: 'Iniciar Nuevo Proceso',
      title_quick: 'Nueva Tarea Rápida',
      desc_quick: 'Crea una acción inmediata en el panel de tareas, sin la complejidad de un proceso completo.',
      context_label: 'CONTEXTO (VINCULAR A...)',
      context_general: 'General (Sin vínculo)',
      context_client: 'Cliente (Proyectos, CS)',
      context_worker: 'Colaborador (RRHH, Nómina)',
      context_order: 'Pedido (Depto. Técnico)',
      what_needs_to_be_done: '¿Qué se debe hacer?',
      what_needs_to_be_done_placeholder: 'Ej: Llamar al Cliente X...',
      department: 'Departamento',
      priority: 'Prioridad',
      scheduled_for: 'Agendado Para',
      sla_deadline: 'Plazo (SLA)',
      additional_details: 'Detalles Adicionales (Opcional)',
      additional_details_placeholder: 'Instrucciones...',
      btn_cancel: 'Cancelar',
      btn_create: 'Crear Incidencia',
      search_client: 'Buscar Cliente',
      search_client_placeholder: 'Nombre del cliente...',
      search_worker: 'Buscar Colaborador',
      search_worker_placeholder: 'Nombre...',
      search_order: 'Buscar Pedido',
      search_order_placeholder: 'Código...',
      time_hours: 'Horas',
      time_days: 'Días'
    }
  },
  tasks: {
    title: 'Gestión de Tareas',
    subtitle: 'Siga su cola de trabajo.',
    tabs: {
      minhas: 'Mis Tareas',
      setor: 'Mi Sector',
      todas: 'Todas'
    },
    kpi: {
      pendentes: 'Mis Pendientes',
      vencidas: 'Vencidas',
      hoje: 'Vencen Hoy'
    },
    table: {
      tarefa: 'Tarea',
      contexto: 'Contexto',
      setor: 'Sector',
      prazo: 'Plazo',
      responsavel: 'Responsable',
      acao: 'Acción'
    },
    status: {
      Pendente: 'Pendiente',
      'Em Andamento': 'En Curso',
      Concluida: 'Concluida'
    },
    actions: {
      assumir: 'Asumir',
      iniciar: 'Iniciar',
      concluir: 'Concluir',
      feito: 'Hecho'
    },
    atrasado: 'RETRASADO',
    vencida_ha: 'Vencida hace {{days}} días',
    assigned_to: 'Asignado a'
  },
  common: {
    loading: 'Cargando...',
    filters_global: 'Filtros Globales',
    period: 'Período',
    company: 'Empresa',
    all_companies: 'Todas las Empresas',
    not_assigned: 'No asignado',
    cancel: 'Cancelar',
    save: 'Guardar'
  }
};
