import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, AlertCircle, Box, Briefcase, Building, CheckSquare, FileText, LayoutDashboard, ListTodo, Settings, ShoppingCart, Upload, UserCog, Users, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <NavLink
      to={to}
      title={!isSidebarOpen ? label : ''}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
          ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-medium'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        } ${!isSidebarOpen && 'justify-center'}`
      }
    >
      <Icon size={18} className="group-hover:scale-105 transition-transform duration-200 flex-shrink-0" />
      {isSidebarOpen && <span className="text-sm truncate">{label}</span>}
    </NavLink>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className={`px-3 mb-2 mt-6 ${!isSidebarOpen && 'text-center'}`}>
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
        {isSidebarOpen ? label : '• • •'}
      </p>
    </div>
  );

  // Helper to get initials
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-20 overflow-y-auto overflow-x-hidden transition-all duration-300`}>
      <div className={`p-5 flex items-center mb-2 ${isSidebarOpen ? 'justify-between' : 'justify-center flex-col gap-2'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
            <Box size={20} />
          </div>
          {isSidebarOpen && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">MCS Operações</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Mastercorp Suite</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu size={18} />
        </button>
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
          <NavItem to="/admin/usuarios" icon={Users} label="Usuários (Login)" />
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <div className={`bg-slate-50 dark:bg-slate-800 rounded-lg ${isSidebarOpen ? 'p-3 flex justify-between' : 'p-2 flex-col justify-center'} items-center group border border-slate-100 dark:border-slate-700 transition-all`}>
          <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'mb-2'}`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex-shrink-0 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs" title={user?.profile?.full_name || user?.email}>
              {getInitials(user?.profile?.full_name, user?.email)}
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {user?.profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.profile?.role || 'User'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={signOut}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
        {isSidebarOpen && (
          <div className="mt-3 text-[10px] text-slate-400 text-center truncate">
            {t('menu.version')} • Enterprise
          </div>
        )}
      </div>
    </aside>
  );
};