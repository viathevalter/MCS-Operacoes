import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, AlertCircle, Box, Briefcase, Building, CheckSquare, FileText, LayoutDashboard, ListTodo, Settings, ShoppingCart, Upload, UserCog, Users } from 'lucide-react';
import { useLanguage } from '../i18n';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
          ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-medium'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }`
      }
    >
      <Icon size={18} className="group-hover:scale-105 transition-transform duration-200" />
      <span className="text-sm">{label}</span>
    </NavLink>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-3 mb-2 mt-6">
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-20 overflow-y-auto transition-colors duration-300">
      <div className="p-5 flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
          <Box size={20} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">MCS Operações</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Mastercorp Suite</p>
        </div>
      </div>

      <div className="flex-1 px-3 py-2">
        <SectionLabel label={t('menu.main_menu')} />
        <div className="space-y-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label={t('menu.dashboard')} />
          <NavItem to="/estimaciones" icon={FileText} label={t('menu.estimaciones')} />
          <NavItem to="/pedidos" icon={ShoppingCart} label={t('menu.pedidos')} />
          <NavItem to="/operacao" icon={Activity} label={t('menu.operacao')} />
          <NavItem to="/clientes" icon={Users} label="Clientes" />
        </div>

        <SectionLabel label={t('menu.daily_mgmt')} />
        <div className="space-y-1">
          <NavItem to="/operacao/tarefas" icon={ListTodo} label={t('menu.minhas_tarefas')} />
          <NavItem to="/incidencias" icon={AlertCircle} label={t('menu.incidencias')} />
        </div>

        <SectionLabel label={t('menu.admin')} />
        <div className="space-y-1">
          <NavItem to="/admin/playbooks" icon={Settings} label={t('menu.playbooks')} />
          <NavItem to="/admin/tasks" icon={CheckSquare} label={t('menu.tarefas_modelo')} />
          <NavItem to="/admin/departamentos" icon={Building} label={t('menu.departamentos')} />
          <NavItem to="/admin/funcionarios" icon={UserCog} label={t('menu.funcionarios')} />
          <NavItem to="/admin/importar-funcionarios" icon={Upload} label="Importar Dados" />
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
              AS
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ana Silva</p>
              <p className="text-[10px] text-slate-400">Admin</p>
            </div>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-slate-400 text-center">
          {t('menu.version')} • Enterprise
        </div>
      </div>
    </aside>
  );
};