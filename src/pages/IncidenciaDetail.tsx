
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, CheckSquare, MessageSquare, Send, Plus,
    AlertTriangle, User, Building, Briefcase, FileText, CheckCircle, Circle, Save, X, Play, Clock, AlertCircle
} from 'lucide-react';
import {
    getIncidencia, listTarefas, listLogs, addLog, updateTarefa, createTarefa, assignTarefa, updateIncidencia
} from '../services/incidencias';
import { authService } from '../services/mock/auth.service';
import type { Incidencia, IncidenciaTarefa, IncidenciaLog } from '../services/types';
import { useLanguage } from '../i18n';
import { ContextCard } from '../components/ContextCard';

export const IncidenciaDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const currentUser = authService.getCurrentUser();

    const [loading, setLoading] = useState(true);
    const [incidencia, setIncidencia] = useState<Incidencia | null>(null);
    const [tarefas, setTarefas] = useState<IncidenciaTarefa[]>([]);
    const [logs, setLogs] = useState<IncidenciaLog[]>([]);

    const [newLogText, setNewLogText] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ titulo: '', departamento: 'Operações', prazo: '' });

    const loadData = async () => {
        if (!id) return;
        try {
            const inc = await getIncidencia(id);
            setIncidencia(inc);
            if (inc) {
                const [t, l] = await Promise.all([listTarefas(inc.id), listLogs(inc.id)]);
                setTarefas(t);
                setLogs(l);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleSendLog = async () => {
        if (!newLogText.trim() || !incidencia) return;
        try {
            await addLog(incidencia.id, newLogText, currentUser.name); // Pass User Name
            setNewLogText('');
            const l = await listLogs(incidencia.id);
            setLogs(l);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdvanceStatus = async (task: IncidenciaTarefa) => {
        let newStatus: IncidenciaTarefa['status'] = 'Pendente';

        if (task.status === 'Pendente') newStatus = 'Em Andamento';
        else if (task.status === 'Em Andamento') newStatus = 'Concluida';
        else if (task.status === 'Concluida') return;

        try {
            await updateTarefa(task.id, { status: newStatus });
            const updatedList = await listTarefas(incidencia!.id);
            setTarefas(updatedList);

            // --- AUTO-UPDATE INCIDENT STATUS LOGIC ---
            // 1. If moving to 'Em Andamento' and incident is 'Aberto', update incident
            if (newStatus === 'Em Andamento' && incidencia!.status === 'Aberto') {
                await updateIncidencia(incidencia!.id, { status: 'Em Andamento' });
                setIncidencia({ ...incidencia!, status: 'Em Andamento' }); // Optimistic update
                await addLog(incidencia!.id, `Status alterado automaticamente para 'Em Andamento' (Tarefa iniciada)`, 'Sistema');
            }

            // 2. If moving to 'Concluida', check if ALL tasks are concluded
            if (newStatus === 'Concluida') {
                const allConcluded = updatedList.every(t => t.status === 'Concluida');
                if (allConcluded && incidencia!.status !== 'Resolvido' && incidencia!.status !== 'Fechado') {
                    await updateIncidencia(incidencia!.id, { status: 'Resolvido', data_fechamento: new Date().toISOString() });
                    setIncidencia({ ...incidencia!, status: 'Resolvido', data_fechamento: new Date().toISOString() }); // Optimistic
                    await addLog(incidencia!.id, `Status alterado automaticamente para 'Resolvido' (Todas tarefas concluídas)`, 'Sistema');
                } else if (incidencia!.status === 'Aberto') {
                    // If at least one task is done (even if others pending), move incident to In Progress if it was Open
                    await updateIncidencia(incidencia!.id, { status: 'Em Andamento' });
                    setIncidencia({ ...incidencia!, status: 'Em Andamento' });
                    await addLog(incidencia!.id, `Status alterado automaticamente para 'Em Andamento' (Tarefa concluída)`, 'Sistema');
                }
            }

            const l = await listLogs(incidencia!.id); // Helper to refresh logs
            setLogs(l);

        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateEvidence = async (taskId: string, evidence: string) => {
        try {
            await updateTarefa(taskId, { evidencia: evidence });
            setTarefas(tarefas.map(t => t.id === taskId ? { ...t, evidencia: evidence } : t));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAssignToMe = async (taskId: string) => {
        try {
            await assignTarefa(taskId, currentUser.email);
            setTarefas(tarefas.map(t => t.id === taskId ? { ...t, responsavel_email: currentUser.email } : t));
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!incidencia) return;
        try {
            await createTarefa({
                incidencia_id: incidencia.id,
                titulo: newTask.titulo,
                departamento: newTask.departamento,
                prazo: newTask.prazo || undefined,
                status: 'Pendente',
                ordem: tarefas.length + 1
            });
            setIsTaskModalOpen(false);
            setNewTask({ titulo: '', departamento: 'Operações', prazo: '' });
            const t = await listTarefas(incidencia.id);
            setTarefas(t);
        } catch (error) {
            console.error(error);
        }
    };

    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return '-';
        const diffMs = new Date(end).getTime() - new Date(start).getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHrs > 24) return `${Math.floor(diffHrs / 24)}d ${diffHrs % 24}h`;
        if (diffHrs > 0) return `${diffHrs}h ${diffMins}m`;
        return `${diffMins}m`;
    };

    const getOverdueLabel = (dueAt?: string, status?: string) => {
        if (!dueAt || status === 'Concluida') return null;
        const now = new Date();
        const due = new Date(dueAt);
        if (due < now) {
            const diffMs = now.getTime() - due.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHrs = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHrs / 24);

            if (diffDays > 0) return `${diffDays}d ${diffHrs % 24}h`;
            if (diffHrs > 0) return `${diffHrs}h ${diffMins % 60}m`;
            return `${diffMins}m`;
        }
        return null;
    };

    if (loading) return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>;
    if (!incidencia) return <div className="p-8 text-center text-red-500">Incidência não encontrada.</div>;

    const getPriorityColor = (p: string) => {
        // Translate priority for check
        const critico = t('incidencias.impacto.Crítico');
        const alto = t('incidencias.impacto.Alto');

        // Check against mock values (PT) or translated
        if (p === 'Critica' || p === 'Crítico' || p === critico) return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
        if (p === 'Alta' || p === 'Alto' || p === alto) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900';
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const statusDisplay = t(`incidencias.status.${incidencia.status}` as any) || incidencia.status;
    const impactDisplay = t(`incidencias.impacto.${incidencia.impacto}` as any) || incidencia.impacto;

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> {t('incidencias.detail.back')}
            </button>

            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">#{incidencia.id.substring(0, 8)}...</span>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{incidencia.titulo}</h1>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPriorityColor(incidencia.impacto)}`}>
                                {impactDisplay}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {statusDisplay}
                            </span>
                            {incidencia.tipo && <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{incidencia.tipo}</span>}
                        </div>
                    </div>
                    <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-end gap-1 mb-1">
                            <Calendar size={14} />
                            {t('incidencias.detail.open')}: {new Date(incidencia.data_abertura).toLocaleDateString()}
                        </div>
                        {incidencia.data_fechamento && (
                            <div className="flex items-center justify-end gap-1 text-emerald-600">
                                <CheckCircle size={14} />
                                {t('incidencias.detail.closed')}: {new Date(incidencia.data_fechamento).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTEXT CARD INTEGRATION */}
                <div className="mb-4">
                    <ContextCard context={incidencia.context} />
                </div>

                {incidencia.descricao && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{incidencia.descricao}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Checklist Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <CheckSquare className="text-blue-600 dark:text-blue-500" size={20} />
                            {t('incidencias.detail.checklist')}
                        </h3>
                        <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="text-xs flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            <Plus size={14} /> {t('incidencias.detail.add_task')}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden transition-colors">
                        {tarefas.length === 0 && <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">{t('incidencias.detail.no_tasks')}</div>}

                        {tarefas.map((task) => {
                            const overdueLabel = getOverdueLabel(task.prazo, task.status);
                            const duration = task.status === 'Concluida' ? calculateDuration(task.started_at, task.completed_at) : null;
                            const taskStatusDisplay = t(`tasks.status.${task.status}` as any) || task.status;

                            return (
                                <div key={task.id} className={`p-4 transition-colors ${task.status === 'Concluida' ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10'}`}>
                                    <div className="flex items-start gap-3">
                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleAdvanceStatus(task)}
                                            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${task.status === 'Concluida'
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : task.status === 'Em Andamento'
                                                    ? 'bg-blue-100 border-blue-400 text-blue-600 animate-pulse'
                                                    : 'border-slate-300 hover:border-blue-400 text-slate-300'
                                                }`}
                                            title={taskStatusDisplay}
                                        >
                                            {task.status === 'Concluida' && <CheckCircle size={14} />}
                                            {task.status === 'Em Andamento' && <Play size={10} fill="currentColor" />}
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className={`font-medium text-sm flex items-center gap-2 ${task.status === 'Concluida' ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {task.titulo}
                                                        {overdueLabel && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] rounded font-bold uppercase no-underline">
                                                                <AlertCircle size={10} />
                                                                {t('tasks.vencida_ha', { days: '' }).replace('ha  dias', '').replace('há  dias', '')} {overdueLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {duration && (
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <Clock size={10} /> Tempo: {duration}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Assignment Logic */}
                                                {task.status !== 'Concluida' && (
                                                    <div className="ml-2 flex-shrink-0">
                                                        {task.responsavel_email ? (
                                                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900" title={`${t('tasks.assigned_to')}: ${task.responsavel_email}`}>
                                                                <User size={10} />
                                                                {task.responsavel_email.split('@')[0]}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAssignToMe(task.id)}
                                                                className="text-[10px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors uppercase font-bold"
                                                            >
                                                                {t('tasks.actions.assumir')}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700">
                                                    {task.departamento || 'Geral'}
                                                </span>
                                                {task.status === 'Em Andamento' && (
                                                    <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                                                        <Play size={10} /> {taskStatusDisplay}
                                                    </span>
                                                )}
                                                {task.prazo && (
                                                    <span className={`flex items-center gap-1 ${overdueLabel ? 'text-red-500 dark:text-red-400 font-bold' : ''}`}>
                                                        <Calendar size={10} /> {new Date(task.prazo).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Evidence Field */}
                                            {task.status !== 'Concluida' && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <FileText size={12} className="text-slate-400 dark:text-slate-500" />
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none text-xs text-slate-600 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600 transition-colors"
                                                        placeholder="Evidência (link/texto)..."
                                                        defaultValue={task.evidencia || ''}
                                                        onBlur={(e) => handleUpdateEvidence(task.id, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleUpdateEvidence(task.id, e.currentTarget.value);
                                                                e.currentTarget.blur();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {task.evidencia && task.status === 'Concluida' && (
                                                <div className="mt-1 text-xs text-slate-500 italic flex items-center gap-1">
                                                    <FileText size={10} /> {task.evidencia}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Timeline / Logs Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquare className="text-blue-600 dark:text-blue-500" size={20} />
                        {t('incidencias.detail.timeline')}
                    </h3>

                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] transition-colors">

                        {/* 1. RICH TEXT INPUT AREA (Top) */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors z-10 relative">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all">
                                {/* Pseud-Toolbar */}
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-slate-400">
                                    <div className="flex gap-1">
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition-colors" title="Bold"><span className="font-bold text-xs">B</span></button>
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition-colors italic" title="Italic"><span className="font-serif text-xs">I</span></button>
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition-colors underline" title="Underline"><span className="underline text-xs">U</span></button>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                    <span className="text-xs text-slate-400 font-medium">Nova Anotação / Atualização</span>
                                </div>
                                <textarea
                                    className="w-full bg-transparent p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none min-h-[120px] resize-none"
                                    placeholder={t('incidencias.detail.comment_placeholder')}
                                    value={newLogText}
                                    onChange={(e) => setNewLogText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            handleSendLog();
                                        }
                                    }}
                                />
                                <div className="flex justify-between items-center px-3 py-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-lg">
                                    <span className="text-[10px] text-slate-400">Ctrl + Enter para enviar</span>
                                    <button
                                        onClick={handleSendLog}
                                        disabled={!newLogText.trim()}
                                        className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Send size={14} /> Registrar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. SCROLLABLE LOG LIST (Bottom) */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/30">
                            {logs.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-60">
                                    <MessageSquare size={32} className="mb-2" />
                                    <div className="text-sm">{t('incidencias.detail.no_logs')}</div>
                                </div>
                            )}

                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-3 group">
                                    <div className="flex flex-col items-center pt-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${log.usuario === 'Sistema' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'}`}>
                                            {log.usuario ? log.usuario.substring(0, 2).toUpperCase() : 'SY'}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.usuario || 'Sistema'}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{new Date(log.criado_em).toLocaleString()}</span>
                                        </div>
                                        <div className="text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm border border-slate-100 dark:border-slate-700/50 group-hover:border-slate-200 transition-colors whitespace-pre-wrap leading-relaxed">
                                            {log.mensagem}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {isTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-sm animate-fade-in border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('incidencias.detail.new_task_title')}</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Título da Tarefa</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none"
                                    value={newTask.titulo}
                                    onChange={e => setNewTask({ ...newTask, titulo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Departamento</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none"
                                    value={newTask.departamento}
                                    onChange={e => setNewTask({ ...newTask, departamento: e.target.value })}
                                >
                                    <option value="Operações">Operações</option>
                                    <option value="RH">RH</option>
                                    <option value="Segurança">Segurança</option>
                                    <option value="Logística">Logística</option>
                                    <option value="Comercial">Comercial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo Limite</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none"
                                    value={newTask.prazo}
                                    onChange={e => setNewTask({ ...newTask, prazo: e.target.value })}
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-medium w-full flex justify-center items-center gap-2 transition-colors">
                                    <Save size={16} /> {t('incidencias.detail.save_task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
