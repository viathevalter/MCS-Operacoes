
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    CheckCircle, Calendar, Filter, Search, Briefcase, User as UserIcon,
    AlertCircle, Layers, ArrowUpRight, CheckSquare, X, Play, Clock, AlertTriangle
} from 'lucide-react';
import { getAllTarefas, updateTarefa, assignTarefa } from '../services/incidencias';
import { incidentTaskService } from '../services/mock/incidentTasks.service';
import { useAuth } from '../contexts/AuthContext';
import type { IncidenciaTarefaExpandida } from '../services/types';
import { useLanguage } from '../i18n';
import { ContextCard } from '../components/ContextCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card } from '../components/ui/Card';

export const Tasks: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [currentUser, setCurrentUser] = useState<any>(user || {}); // Fallback/Compatibility
    const { t } = useLanguage();

    // Data State
    const [allTasks, setAllTasks] = useState<IncidenciaTarefaExpandida[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [activeTab, setActiveTab] = useState<'minhas' | 'setor' | 'todas'>('minhas');
    const [statusFilter, setStatusFilter] = useState<string>('Pendente');
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyOverdue, setOnlyOverdue] = useState(false);

    // Template Form State
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState<{
        title: string;
        description: string;
        departmentId: string;
        sla: number;
        slaUnit: 'hours' | 'days';
    }>({ title: '', description: '', departmentId: '', sla: 1, slaUnit: 'days' });

    const loadData = async () => {
        setLoading(true);
        try {
            await incidentTaskService.checkForOverdueTasks();
            const data = await getAllTarefas();
            setAllTasks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
        }
    }, [user]);

    useEffect(() => {
        const searchId = searchParams.get('search');
        if (searchId) {
            setSearchTerm(searchId);
            setActiveTab('todas');
            setStatusFilter('Todos');
        }
        loadData();
    }, [searchParams]);

    const handleAdvanceStatus = async (task: IncidenciaTarefaExpandida) => {
        let newStatus = 'Pendente';
        if (task.status === 'Pendente') newStatus = 'Em Andamento';
        else if (task.status === 'Em Andamento') newStatus = 'Concluida';
        else return;

        await updateTarefa(task.id, { status: newStatus as any });
        await loadData();
    };

    const handleAssignToMe = async (id: string) => {
        await assignTarefa(id, currentUser.email);
        await loadData();
    };

    // --- Filtering Logic ---
    const filteredData = useMemo(() => {
        return allTasks.filter(t => {
            if (activeTab === 'minhas') {
                if (t.responsavel_email !== currentUser.email) return false;
            } else if (activeTab === 'setor') {
                const userDeptName = 'Operações';
                if (t.departamento !== userDeptName) return false;
            }
            if (statusFilter && statusFilter !== 'Todos') {
                if (t.status !== statusFilter) return false;
            }
            if (searchTerm) {
                const lower = searchTerm.toLowerCase();
                const matchTitle = t.titulo.toLowerCase().includes(lower);
                const matchInc = t.incidencia_titulo?.toLowerCase().includes(lower);
                const matchId = String(t.id).includes(lower) || String(t.incidencia_id).includes(lower);
                if (!matchTitle && !matchInc && !matchId) return false;
            }
            if (onlyOverdue) {
                if (!t.prazo) return false;
                if (t.status === 'Concluida') return false;
                const isLate = new Date(t.prazo) < new Date();
                if (!isLate) return false;
            }
            return true;
        });
    }, [allTasks, activeTab, statusFilter, searchTerm, onlyOverdue, currentUser.email]);

    const myTasks = allTasks.filter(t => t.responsavel_email === currentUser.email && t.status !== 'Concluida');
    const myPendingCount = myTasks.length;
    const myOverdueCount = myTasks.filter(t => t.prazo && new Date(t.prazo) < new Date()).length;
    const todayStr = new Date().toISOString().split('T')[0];
    const myDueTodayCount = myTasks.filter(t => t.prazo && t.prazo.startsWith(todayStr)).length;

    return (
        <div className="space-y-6 animate-fade-in font-inter pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        {t('tasks.title')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Olá, <span className="font-medium text-slate-900 dark:text-slate-200">{currentUser.name}</span>. {t('tasks.subtitle')}
                    </p>
                </div>

                {/* Summary Cards (Compact) */}
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 transition-colors">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Layers size={16} /></div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks.kpi.pendentes')}</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{myPendingCount}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 transition-colors">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg"><AlertTriangle size={16} /></div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks.kpi.vencidas')}</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{myOverdueCount}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 transition-colors">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={16} /></div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks.kpi.hoje')}</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{myDueTodayCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Area */}
            <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="flex space-x-6">
                        <button
                            onClick={() => setActiveTab('minhas')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${activeTab === 'minhas'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                        >
                            <UserIcon size={16} /> {t('tasks.tabs.minhas')}
                        </button>
                        <button
                            onClick={() => setActiveTab('setor')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${activeTab === 'setor'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                        >
                            <Briefcase size={16} /> {t('tasks.tabs.setor')}
                        </button>
                        {user?.profile?.role === 'admin' && (
                            <button
                                onClick={() => setActiveTab('todas')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${activeTab === 'todas'
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                            >
                                <Layers size={16} /> {t('tasks.tabs.todas')}
                            </button>
                        )}
                    </nav>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('incidencias.filters.search_placeholder')}
                            className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

                    <select
                        className="bg-transparent py-2 px-3 text-sm text-slate-600 dark:text-slate-400 font-medium focus:outline-none cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="Todos">{t('incidencias.filters.status_all')}</option>
                        <option value="Pendente">{t('tasks.status.Pendente')}</option>
                        <option value="Em Andamento">{t('tasks.status.Em Andamento')}</option>
                        <option value="Concluida">{t('tasks.status.Concluida')}</option>
                    </select>

                    <button
                        onClick={() => setOnlyOverdue(!onlyOverdue)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${onlyOverdue
                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900 shadow-sm'
                            : 'bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <AlertCircle size={16} />
                        {t('tasks.kpi.vencidas')}
                    </button>

                    {(searchTerm || statusFilter !== 'Todos' || onlyOverdue) && (
                        <button
                            onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); setOnlyOverdue(false); }}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">{t('common.loading')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{t('tasks.table.tarefa')}</th>
                                    <th className="px-6 py-4 w-64">{t('tasks.table.contexto')}</th>
                                    <th className="px-6 py-4">{t('tasks.table.setor')}</th>
                                    <th className="px-6 py-4">{t('tasks.table.prazo')}</th>
                                    <th className="px-6 py-4">{t('tasks.table.responsavel')}</th>
                                    <th className="px-6 py-4 text-right">{t('tasks.table.acao')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length === 0 ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-slate-400">Nenhum dado encontrado.</td></tr>
                                ) : (
                                    filteredData.map(task => {
                                        const isDone = task.status === 'Concluida';
                                        const now = new Date();
                                        const dueDate = task.prazo ? new Date(task.prazo) : null;
                                        const isLate = dueDate ? dueDate < now : false;
                                        const diffDays = dueDate ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)) : 0;

                                        return (
                                            <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 flex-shrink-0">
                                                            <StatusBadge
                                                                status={task.status}
                                                                type="status"
                                                                className={isDone ? 'opacity-70 shadow-none' : 'shadow-sm'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className={`font-medium ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>{task.titulo}</div>
                                                            {task.evidencia && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1"><CheckCircle size={12} /> {task.evidencia}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div onClick={() => navigate(`/incidencias/${task.incidencia_id}`)} className="cursor-pointer group/link mb-2">
                                                        <div className="text-blue-600 font-medium group-hover/link:underline text-xs flex items-center gap-1 mb-1">
                                                            {task.incidencia_titulo} <ArrowUpRight size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <ContextCard context={task.context} compact />
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        <Briefcase size={10} /> {task.departamento}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {task.prazo ? (
                                                        <div className={`flex flex-col ${!isDone && isLate ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            <div className="flex items-center gap-1.5 font-medium text-xs">
                                                                <Calendar size={14} />
                                                                {new Date(task.prazo).toLocaleDateString()}
                                                            </div>
                                                            {!isDone && isLate && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded w-fit mt-1 border border-rose-100 dark:border-rose-900">
                                                                    <AlertCircle size={10} />
                                                                    {t('tasks.vencida_ha', { days: diffDays })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-slate-300">-</span>}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {task.responsavel_email ? (
                                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-800 shadow-sm">
                                                                {task.responsavel_email.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-xs truncate max-w-[120px] font-medium">{task.responsavel_email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic">Não atribuído</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top text-right">
                                                    {!isDone ? (
                                                        <div className="flex justify-end gap-2">
                                                            {!task.responsavel_email && (
                                                                <button
                                                                    onClick={() => handleAssignToMe(task.id)}
                                                                    className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                                                                >
                                                                    {t('tasks.actions.assumir')}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleAdvanceStatus(task)}
                                                                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all font-medium ${task.status === 'Em Andamento'
                                                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow'
                                                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow'
                                                                    }`}
                                                            >
                                                                {task.status === 'Em Andamento' ? (
                                                                    <>
                                                                        <CheckCircle size={14} /> {t('tasks.actions.concluir')}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Play size={14} fill="currentColor" /> {t('tasks.actions.iniciar')}
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                                                            {t('tasks.actions.feito')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
