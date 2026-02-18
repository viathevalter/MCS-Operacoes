import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Estimaciones } from './pages/Estimaciones';
import { Pedidos } from './pages/Pedidos';
import { Operacao } from './pages/Operacao';
import { Incidencias } from './pages/Incidencias';
import { IncidenciaDetail } from './pages/IncidenciaDetail';
import { Clientes } from './pages/Clientes';
import { Cliente360 } from './pages/Cliente360';
import { Comercial360 } from './pages/Comercial360';
import { Playbooks } from './pages/Playbooks';
import { TaskTemplates } from './pages/TaskTemplates';
import { Departamentos } from './pages/admin/Departamentos';
import { Funcionarios } from './pages/admin/Funcionarios';
import { ImportarFuncionarios } from './pages/admin/ImportarFuncionarios';
import { Tasks } from './pages/Tasks';
import type { Filters } from './services/types';
import { authService } from './services/mock/auth.service';
import { useLanguage } from './i18n';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    monthRange: [new Date().toISOString().slice(0, 7), new Date().toISOString().slice(0, 7)],
    empresa: null,
    comercial: null,
    cliente: null
  });

  const { setLanguage } = useLanguage();

  useEffect(() => {
    // 1. Check User Profile Preference (Highest priority)
    const user = authService.getCurrentUser();

    if (user.language) {
      setLanguage(user.language);
    } else {
      // 2. Fallback to LocalStorage (handled by Provider init) or 'pt'
      const savedLang = localStorage.getItem('app_lang');
      if (savedLang === 'pt' || savedLang === 'es') {
        setLanguage(savedLang);
      } else {
        setLanguage('pt');
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Sidebar />
      {/* Main Content Area - Full Fluid Width */}
      <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard filters={filters} setFilters={setFilters} />} />
            <Route path="/estimaciones" element={<Estimaciones filters={filters} setFilters={setFilters} />} />
            <Route path="/pedidos" element={<Pedidos filters={filters} setFilters={setFilters} />} />
            <Route path="/operacao" element={<Operacao filters={filters} setFilters={setFilters} />} />
            <Route path="/operacao/tarefas" element={<Tasks />} />
            <Route path="/incidencias" element={<Incidencias />} />
            <Route path="/incidencias/:id" element={<IncidenciaDetail />} />
            <Route path="/admin/playbooks" element={<Playbooks />} />
            <Route path="/admin/tasks" element={<TaskTemplates />} />
            <Route path="/admin/departamentos" element={<Departamentos />} />
            <Route path="/admin/funcionarios" element={<Funcionarios />} />
            <Route path="/admin/importar-funcionarios" element={<ImportarFuncionarios />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<Cliente360 />} />
            <Route path="/comerciais/:id" element={<Comercial360 />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;