import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Edit, Save, Trash2, UserPlus, X, Search, Filter } from 'lucide-react';

interface MCSUser {
    id: string;
    email: string;
    role: 'admin' | 'user' | 'manager';
    display_name: string;
    department_id?: string;
}

interface DepartmentMember {
    id: string;
    nombrecompleto: string;
    usuario: string;
    user_id?: string; // Linked auth id
    mcs_departments?: { name: string } | null;
}

export const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<MCSUser[]>([]);
    const [employees, setEmployees] = useState<DepartmentMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<MCSUser> & { employee_id?: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch System Users
            const { data: usersData, error: usersError } = await supabase
                .from('mcs_users')
                .select('*')
                .order('email');

            if (usersError) throw usersError;

            // Fetch Employees for linking
            const { data: empData, error: empError } = await supabase
                .from('mcs_department_members')
                .select(`
                    id, 
                    nombrecompleto, 
                    usuario, 
                    user_id,
                    mcs_departments ( name )
                `)
                .eq('active', true)
                .order('nombrecompleto');

            if (empError) throw empError;

            setUsers(usersData || []);
            setEmployees(empData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (u: MCSUser) => {
        // Find linked employee
        const linkedEmp = employees.find(e => e.user_id === u.id);
        setEditingUser(u.id);
        setFormData({
            role: u.role,
            display_name: u.display_name,
            employee_id: linkedEmp?.id || ''
        });
    };

    const handleSave = async (userId: string) => {
        try {
            // 1. Update mcs_users role/display_name
            const { error: userError } = await supabase
                .from('mcs_users')
                .update({
                    role: formData.role,
                    display_name: formData.display_name
                })
                .eq('id', userId);

            if (userError) throw userError;

            // 2. Update Employee Link
            // First unlink any employee currently linked to this user (if changing)
            // Ideally we'd do this more carefully, but for now:

            if (formData.employee_id) {
                // Remove link from old employee if different
                // Actually, just set the new one. The old one might remain linked if we are not careful, 
                // but usually user_id is unique on department members? 
                // Let's first clear THIS user from ALL employees (unlink all)
                await supabase
                    .from('mcs_department_members')
                    .update({ user_id: null })
                    .eq('user_id', userId);

                // Now link selected
                const { error: linkError } = await supabase
                    .from('mcs_department_members')
                    .update({ user_id: userId })
                    .eq('id', formData.employee_id);

                if (linkError) throw linkError;
            } else {
                // If empty, just unlink
                await supabase
                    .from('mcs_department_members')
                    .update({ user_id: null })
                    .eq('user_id', userId);
            }

            setEditingUser(null);
            fetchData(); // Refresh
        } catch (error) {
            console.error('Error saving:', error);
            alert('Erro ao salvar alterações');
        }
    };

    if (!user?.isAdmin) {
        return <div className="p-8">Acesso Negado. Apenas administradores.</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gerenciar Usuários</h1>
                    <p className="text-slate-500">Controle de acesso e vínculo com funcionários</p>
                </div>
                {/* Future: Invite User Button */}
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <UserPlus size={18} />
                    Convidar Usuário (Em Breve)
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                    >
                        <option value="">Todos os Departamentos</option>
                        {Array.from(new Set(employees.map(e => e.mcs_departments?.name).filter(Boolean))).sort().map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Email (Login)</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Nome de Exibição</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Permissão</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Funcionário Vinculado</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Departamento</th>
                            <th className="px-6 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {users.filter(u => {
                            const linkedEmp = employees.find(e => e.user_id === u.id);
                            const searchLower = searchTerm.toLowerCase();
                            const matchesSearch =
                                (u.display_name?.toLowerCase().includes(searchLower) ?? false) ||
                                u.email.toLowerCase().includes(searchLower) ||
                                (linkedEmp?.nombrecompleto.toLowerCase().includes(searchLower) ?? false);

                            const matchesDept = filterDepartment ? linkedEmp?.mcs_departments?.name === filterDepartment : true;

                            return matchesSearch && matchesDept;
                        }).map(u => {
                            const isEditing = editingUser === u.id;
                            const linkedEmp = employees.find(e => e.user_id === u.id);

                            return (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {u.email}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {isEditing ? (
                                            <input
                                                className="border rounded px-2 py-1 w-full dark:bg-slate-800 dark:border-slate-600"
                                                value={formData.display_name || ''}
                                                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                            />
                                        ) : (
                                            u.display_name || '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <select
                                                className="border rounded px-2 py-1 dark:bg-slate-800 dark:border-slate-600"
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                            >
                                                <option value="user">Usuário</option>
                                                <option value="manager">Gerente</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                    u.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {isEditing ? (
                                            <select
                                                className="border rounded px-2 py-1 w-full dark:bg-slate-800 dark:border-slate-600"
                                                value={formData.employee_id}
                                                onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                            >
                                                <option value="">-- Sem Vínculo --</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.nombrecompleto} ({emp.usuario || 'Sem user'})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            linkedEmp ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{linkedEmp.nombrecompleto}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Não vinculado</span>
                                            )
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {linkedEmp ? (
                                            <span className="text-sm">{linkedEmp.mcs_departments?.name || '-'}</span>
                                        ) : (
                                            <span className="text-slate-400 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleSave(u.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={18} /></button>
                                                <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:bg-slate-50 rounded"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(u)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                title="Editar Permissões"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
