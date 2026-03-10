
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
    departamentos: 'Departamentos',
    funcionarios: 'Trabajadores',
    clientes: 'Clientes',
    comissoes: 'Gestión de Comisiones',
    importar_dados: 'Importar Datos',
    usuarios: 'Usuarios (Acceso)',
    sair: 'Salir',
    main_menu: 'Menú Principal',
    daily_mgmt: 'Gestión Diaria',
    version: 'v2.5.0 (Operaciones)',
    app_name: 'MCS Operaciones',
    app_subtitle: 'Mastercorp Suite'
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
      save_task: 'Guardar Tarea',
      not_found: 'Incidencia no encontrada.',
      task_title: 'Título de la Tarea',
      deadline: 'Plazo Límite',
      assign_to: 'Asignar a (Opcional)',
      unassigned: 'No asignar (Queda libre)'
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
    },
    messages: {
      log_success: 'Log registrado con éxito',
      log_error: 'Error al registrar el log',
      task_status_updated: 'Estado de la tarea actualizado: {{status}}',
      task_status_error: 'Error al actualizar el estado de la tarea',
      update_success: 'Incidencia actualizada con éxito',
      update_error: 'Error al actualizar la incidencia',
      task_assigned_success: 'Tarea asignada a ti',
      task_assigned_error: 'Error al asignar la tarea',
      task_update_success: 'Tarea actualizada con éxito',
      task_create_success: 'Tarea creada con éxito',
      task_save_error: 'Error al guardar la tarea',
      task_delete_success: 'Tarea eliminada',
      task_delete_error: 'Error al eliminar la tarea'
    },
    logs: {
      auto_status_change: "Estado alterado automáticamente a '{{status}}'",
      manual_edit: "Detalles de la incidencia editados manualmente."
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
    assigned_to: 'Asignado a',
    messages: {
      delete_success: 'Tarea eliminada',
      delete_error: 'Error al eliminar la tarea',
      update_success: 'Tarea actualizada',
      update_error: 'Error al actualizar la tarea'
    }
  },
  funcionarios: {
    title: 'Empleados',
    subtitle: 'Administrar el registro de colaboradores',
    btn_new: 'Nuevo Empleado',
    filters: {
      search_placeholder: 'Buscar por nombre, departamento, empresa o usuario...',
      all_departments: 'Todos los Departamentos',
      all_companies: 'Todas las Empresas Contratantes'
    },
    table: {
      name: 'Nombre / Usuario',
      department: 'Departamento',
      company: 'Empresa (Contratante)',
      status: 'Estado',
      actions: 'Acciones'
    },
    status: {
      Ativo: 'Activo',
      Inativo: 'Inactivo',
      Desligado: 'Desvinculado',
      Indefinido: 'Indefinido'
    },
    empty_search: 'No se encontró ningún empleado.',
    modal: {
      title_new: 'Nuevo Empleado',
      title_edit: 'Editar Empleado',
      personal_info: 'Información Personal',
      full_name: 'Nombre Completo *',
      birth_date: 'Fecha de Nacimiento',
      contact: 'Contacto',
      email: 'Email Empresarial',
      phone: 'Teléfono Directo',
      extension: 'Extensión',
      contract_data: 'Datos Contractuales',
      department: 'Departamento *',
      select_department: 'Seleccione un departamento',
      responsibility_code: 'Código de Responsabilidad',
      hiring_company: 'Empresa Contratante',
      select_company: 'Seleccione la empresa...',
      service_company: 'Empresa de Servicios',
      workplace: 'Lugar de Trabajo',
      start_date: 'Fecha de Inicio',
      iban: 'IBAN',
      system_user: 'Usuario (Sistema)',
      btn_cancel: 'Cancelar',
      btn_save: 'Guardar Cambios',
      btn_create: 'Crear Empleado',
      placeholder_name: 'Ej: Juan Pérez',
      placeholder_email: 'email@empresa.com',
      placeholder_phone: '(00) 0000-0000',
      placeholder_extension: 'Ej: 123',
      placeholder_iban: 'ES50...',
      placeholder_user: 'Nombre de usuario o login'
    },
    messages: {
      error_loading: 'Error al cargar los datos. Por favor, inténtelo de nuevo.',
      error_mandatory: 'Nombre completo y Departamento son obligatorios.',
      error_update: 'Error al actualizar empleado.',
      error_create: 'Error al crear empleado.',
      error_save: 'Ocurrió un error al guardar.',
      confirm_delete: '¿Está seguro de que desea eliminar este empleado?',
      error_delete: 'Error al eliminar empleado.'
    }
  },
  operacao: {
    title: 'Operación: Reemplazos & Reubicaciones',
    filters: {
      search: 'Buscar cliente o código...',
      type_all: 'Todos',
      type_reemplazo: 'Reemplazo',
      type_reubicacion: 'Reubicacion'
    },
    table: {
      recent_events: 'Eventos Recientes ({{count}})',
      operation: 'Operación',
      client: 'Cliente',
      type: 'Tipo',
      date: 'Fecha',
      qty_people: 'Cant. Personas'
    },
    drawer: {
      details: 'Detalles de la {{type}}',
      close: 'Cerrar',
      summary_client: 'Cliente',
      summary_date: 'Fecha Inicio',
      summary_status: 'Estado',
      summary_reason: 'Motivo',
      movement_title: 'Movimiento de Personal',
      collab: 'Colaborador',
      role: 'Función',
      movement: 'Movimiento',
      empty_movement: 'Ningún movimiento registrado.',
      profiles_title: 'Perfiles Solicitados',
      profile: 'Perfil',
      qty: 'Cant',
      empty_profiles: 'Ningún artículo solicitado.'
    }
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
  },
  import_funcionarios: {
    title: 'Importar Empleados',
    subtitle: 'Soporta archivos .CSV y .XLSX (Excel)',
    click_to_select: 'Haga clic para seleccionar archivo (CSV o Excel)',
    supported_formats: 'Formatos soportados: .csv, .xlsx, .xls',
    success: 'Éxito',
    errors: 'Errores',
    btn_start: 'Iniciar Importación',
    btn_processing: 'Procesando...',
    logs: {
      error_companies: 'Error al buscar empresas',
      reading_file: 'Leyendo archivo',
      read_success: '¡Archivo leído con éxito! {{count}} líneas encontradas.',
      read_error: 'Error al leer archivo',
      no_data: 'No hay datos para procesar.',
      starting: 'Iniciando procesamiento...',
      header_detected: 'Encabezado detectado en la línea 1.',
      error_dept: 'ERROR - ID Depto "{{dept}}" desconocido.',
      db_error: 'Fallo en la BD',
      exception: 'Excepción',
      row: 'Línea',
      end_process: '--- FIN DEL PROCESO ---'
    }
  },
  comissoes: {
    title: 'Gestión de Comisiones',
    subtitle: 'Control de bonos, cuentas por cobrar y cuentas corrientes',
    filters: {
      all_sellers: 'Todos los Vendedores',
      label: 'Filtros:',
      client_placeholder: 'Filtrar por Cliente...',
      order_placeholder: 'Pedido (PO-...)',
      all_entries: 'Todos los Registros',
      type_hire: '(+) Contratación Base',
      type_bonus: '(+) Bono Nuevo Cliente',
      type_discount: '(-) Reemplazos (Desc.)',
      type_adjust: 'Ajustes / Pagos'
    },
    cards: {
      to_receive: 'A Recibir / Saldo',
      total_paid: 'Total Pagado (Mes)',
      adjustments: 'Registros / Ajustes',
      rules: 'Reglas Comerciales'
    },
    rules: {
      base: 'Base',
      new_client: 'Cliente Nuevo',
      grace_period: 'Carencia Descuento',
      days: 'días'
    },
    table: {
      title: 'Extracto Detallado',
      btn_extra: 'Registro Extra',
      btn_pay: 'Pagar',
      col_date: 'Fecha',
      col_seller: 'Vendedor',
      col_history: 'Historial',
      col_value: 'Valor (€)',
      col_status: 'Estado',
      empty: 'Ningún registro en el período seleccionado.',
      paid_on: 'Pagado el'
    },
    modal: {
      title: 'Nuevo Ajuste / Registro',
      table_label: 'Tabla de Registro',
      type_pos: 'Ajuste Positivo (+)',
      type_neg: 'Ajuste Negativo (-)',
      type_pay: 'Pago Aislado (-)',
      seller_label: 'Vendedor',
      seller_placeholder: 'Seleccione un vendedor existente...',
      desc_label: 'Descripción',
      desc_placeholder: 'Ej: Pago Adelantado / Descuento Averías',
      value_label: 'Valor (€)',
      value_hint: 'Ingrese siempre el valor absoluto en positivo. El sistema restará si es un ajuste negativo o adelanto.',
      btn_cancel: 'Cancelar',
      btn_save: 'Guardar Registro'
    },
    messages: {
      load_error: 'Error al cargar comisiones.',
      confirm_pay: '¿Confirma el pago de {{count}} comisiones seleccionadas?',
      pay_success: '¡Pagos registrados con éxito!',
      pay_error: 'Error al registrar pagos.',
      save_error: 'Error al guardar ajuste'
    }
  }
};
