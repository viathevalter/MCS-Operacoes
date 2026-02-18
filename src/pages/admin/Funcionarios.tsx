import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Save,
    User,
    Building,
    Briefcase,
    Mail,
    MapPin,
    Phone,
    Calendar,
    CreditCard,
    UserCheck
} from 'lucide-react';
import { supabaseEmployeeService, Employee } from '../../services/db/SupabaseEmployeeService';
import { supabaseDepartmentService } from '../../services/db/SupabaseDepartmentService';
import { supabaseCompanyService, Company } from '../../services/db/SupabaseCompanyService';
import type { Department } from '../../services/types';

interface FormData {
    department_id: string;
    empresa_contratante_id: number | '';
    empresa_servicos_id: number | '';
    nombrecompleto: string;
    correoempresarial: string;
    ubicaciontrabajo: string;
    codigoresponsabilidad: string;
    telefonodirecto: string;
    extenciontelefonica: string;
    fechainicio: string;
    fechanacimiento: string;
    estadotrabajador: string;
    iban: string;
    usuario: string;
}

const initialFormState: FormData = {
    department_id: '',
    empresa_contratante_id: '',
    empresa_servicos_id: '',
    nombrecompleto: '',
    correoempresarial: '',
    ubicaciontrabajo: '',
    codigoresponsabilidad: '',
    telefonodirecto: '',
    extenciontelefonica: '',
    fechainicio: '',
    fechanacimiento: '',
    estadotrabajador: 'Ativo',
    iban: '',
    usuario: ''
};

export const Funcionarios: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(initialFormState);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [employeesData, departmentsData, companiesData] = await Promise.all([
                supabaseEmployeeService.list(),
                supabaseDepartmentService.list(),
                supabaseCompanyService.list()
            ]);
            // Show all employees, including inactive ones, but maybe style them differently
            setEmployees(employeesData);
            setDepartments(departmentsData.filter(d => d.active !== false));
            setCompanies(companiesData);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Erro ao carregar dados. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (employee?: Employee) => {
        if (employee) {
            setEditingId(employee.id);
            setFormData({
                department_id: employee.department_id,
                empresa_contratante_id: employee.empresa_contratante_id || '',
                empresa_servicos_id: employee.empresa_servicos_id || '',
                nombrecompleto: employee.nombrecompleto,
                correoempresarial: employee.correoempresarial || '',
                ubicaciontrabajo: employee.ubicaciontrabajo || '',
                codigoresponsabilidad: employee.codigoresponsabilidad || '',
                telefonodirecto: employee.telefonodirecto || '',
                extenciontelefonica: employee.extenciontelefonica || '',
                fechainicio: employee.fechainicio || '',
                fechanacimiento: employee.fechanacimiento || '',
                estadotrabajador: employee.estadotrabajador || 'Ativo',
                iban: employee.iban || '',
                usuario: employee.usuario || ''
            });
        } else {
            setEditingId(null);
            setFormData(initialFormState);
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombrecompleto || !formData.department_id) {
            setError('Nome completo e Departamento são obrigatórios.');
            return;
        }

        try {
            // Logic to sync active status with estadotrabajador
            const isActive = formData.estadotrabajador === 'Ativo';

            const payload: Partial<Employee> = {
                ...formData,
                active: isActive, // Set active based on status selection
                empresa_contratante_id: formData.empresa_contratante_id === '' ? null : Number(formData.empresa_contratante_id),
                empresa_servicos_id: formData.empresa_servicos_id === '' ? null : Number(formData.empresa_servicos_id)
            };

            if (editingId) {
                const success = await supabaseEmployeeService.update(editingId, payload);
                if (success) {
                    await loadData();
                    setIsModalOpen(false);
                } else {
                    setError('Erro ao atualizar funcionário.');
                }
            } else {
                const result = await supabaseEmployeeService.create(payload);
                if (result) {
                    await loadData();
                    setIsModalOpen(false);
                } else {
                    setError('Erro ao criar funcionário.');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao salvar.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            const success = await supabaseEmployeeService.delete(id);
            if (success) {
                // Optimistic update or reload
                await loadData();
            } else {
                alert('Erro ao excluir funcionário.');
            }
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.nombrecompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.department_name && employee.department_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.empresa_contratante_nome && employee.empresa_contratante_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.usuario && employee.usuario.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Ativo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Inativo': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Desligado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <User className="text-blue-600" />
                        Funcionários
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie o cadastro de colaboradores
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Novo Funcionário</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, departamento, empresa ou usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome / Usuário</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departamento</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa (Contratante)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Nenhum funcionário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 dark:text-slate-100">{employee.nombrecompleto}</span>
                                                {employee.usuario && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <UserCheck size={12} /> {employee.usuario}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {employee.department_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {employee.empresa_contratante_nome || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.estadotrabajador)}`}>
                                                {employee.estadotrabajador || 'Indefinido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(employee)}
                                                className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(employee.id)}
                                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* --- Informações Pessoais --- */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 mb-4">Informações Pessoais</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Nome Completo *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={formData.nombrecompleto}
                                                onChange={(e) => setFormData({ ...formData, nombrecompleto: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ex: João da Silva"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Data de Nascimento
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="date"
                                                value={formData.fechanacimiento}
                                                onChange={(e) => setFormData({ ...formData, fechanacimiento: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* --- Contato --- */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 mb-4">Contato</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Email Empresarial
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                value={formData.correoempresarial}
                                                onChange={(e) => setFormData({ ...formData, correoempresarial: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="email@empresa.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Telefone Direto
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.telefonodirecto}
                                                    onChange={(e) => setFormData({ ...formData, telefonodirecto: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="(00) 0000-0000"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Ramal
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.extenciontelefonica}
                                                onChange={(e) => setFormData({ ...formData, extenciontelefonica: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ex: 123"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* --- Dados Contratuais --- */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 mb-4">Dados Contratuais</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Departamento *
                                            </label>
                                            <select
                                                required
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Selecione um departamento</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Código de Responsabilidade
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.codigoresponsabilidad}
                                                onChange={(e) => setFormData({ ...formData, codigoresponsabilidad: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Empresa Contratante
                                            </label>
                                            <select
                                                value={formData.empresa_contratante_id}
                                                onChange={(e) => setFormData({ ...formData, empresa_contratante_id: e.target.value === '' ? '' : Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Selecione a empresa...</option>
                                                {companies.map(company => (
                                                    <option key={company.id} value={company.id}>
                                                        {company.nome_pbi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Empresa de Serviços
                                            </label>
                                            <select
                                                value={formData.empresa_servicos_id}
                                                onChange={(e) => setFormData({ ...formData, empresa_servicos_id: e.target.value === '' ? '' : Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Selecione a empresa...</option>
                                                {companies.map(company => (
                                                    <option key={company.id} value={company.id}>
                                                        {company.nome_pbi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Local de Trabalho
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.ubicaciontrabajo}
                                                    onChange={(e) => setFormData({ ...formData, ubicaciontrabajo: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Data de Início
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="date"
                                                    value={formData.fechainicio}
                                                    onChange={(e) => setFormData({ ...formData, fechainicio: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                IBAN
                                            </label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.iban}
                                                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="PT50..."
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Usuário (Sistema)
                                                </label>
                                                <div className="relative">
                                                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={formData.usuario}
                                                        onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Nome de usuário ou login"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Status
                                                </label>
                                                <select
                                                    value={formData.estadotrabajador}
                                                    onChange={(e) => setFormData({ ...formData, estadotrabajador: e.target.value })}
                                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="Ativo">Ativo</option>
                                                    <option value="Inativo">Inativo</option>
                                                    <option value="Desligado">Desligado</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    <Save size={18} />
                                    <span>{editingId ? 'Salvar Alterações' : 'Criar Funcionário'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
