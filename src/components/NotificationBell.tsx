import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, AlertCircle, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/mock/notifications.service';
import { incidentTaskService } from '../services/mock/incidentTasks.service';
import type { Notification } from '../types/models';
import { authService } from '../services/mock/auth.service';

export const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        // Trigger check for overdue tasks whenever we reload notifications
        await incidentTaskService.checkForOverdueTasks();
        
        const list = await notificationService.listByUser(currentUser.email);
        const count = await notificationService.getUnreadCount(currentUser.email);
        setNotifications(list.slice(0, 10)); // Top 10
        setUnreadCount(count);
    };

    useEffect(() => {
        loadNotifications();
        // Polling every minute
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead(currentUser.email);
        await loadNotifications();
    };

    const handleItemClick = async (n: Notification) => {
        if (!n.read_at) {
            await notificationService.markAsRead(n.id);
            await loadNotifications();
        }
        setIsOpen(false);
        
        if (n.entity_type === 'incident') {
            navigate(`/incidencias/${n.entity_id}`);
        } else if (n.entity_type === 'task') {
            // Since we don't have a direct Task Detail page yet, we go to Incidencia or Tasks list
            // Assuming incident_id is not directly available in Notification, we might need to find it or redirect to Tasks list filtering by ID
            // For now, let's go to Tasks List
            navigate(`/operacao/tarefas?search=${n.entity_id}`); 
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'task_overdue': return <AlertCircle size={16} className="text-red-500" />;
            case 'task_assigned': return <Check size={16} className="text-blue-500" />;
            case 'incident_update': return <Info size={16} className="text-amber-500" />;
            default: return <Bell size={16} className="text-slate-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-fade-in origin-top-right">
                    <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                        <h3 className="text-sm font-bold text-slate-700">Notificações</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
                                Marcar todas lidas
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm">
                                Nenhuma notificação.
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-50">
                                {notifications.map(n => (
                                    <li 
                                        key={n.id} 
                                        onClick={() => handleItemClick(n)}
                                        className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read_at ? 'bg-blue-50/40' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${!n.read_at ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <span className="text-[10px] text-slate-400 mt-1 block">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            {!n.read_at && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="p-2 border-t border-slate-100 text-center">
                         <button onClick={() => { /* Navigate to all */ setIsOpen(false); }} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                            Ver histórico completo
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};