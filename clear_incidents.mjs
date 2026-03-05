import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
    console.log('--- Iniciando limpeza de Incidências e Tarefas ---');

    try {
        // 1. Fetch and delete tasks
        console.log('Buscando tarefas...');
        const { data: tasks, error: tasksError } = await supabase
            .from('mcs_incident_tasks')
            .select('id');

        if (tasksError) throw tasksError;

        if (tasks && tasks.length > 0) {
            console.log(`Encontradas ${tasks.length} tarefas. Deletando...`);
            const taskIds = tasks.map(t => t.id);
            // Delete em lotes se necessário ou um a um
            for (const id of taskIds) {
                const { error: delError } = await supabase.from('mcs_incident_tasks').delete().eq('id', id);
                if (delError) console.error(`Erro ao deletar tarefa ${id}:`, delError);
            }
            console.log('Tarefas deletadas com sucesso.');
        } else {
            console.log('Nenhuma tarefa encontrada.');
        }

        // 2. Fetch and delete incidents
        console.log('Buscando incidências...');
        const { data: incidents, error: incError } = await supabase
            .from('mcs_incidents')
            .select('id');

        if (incError) throw incError;

        if (incidents && incidents.length > 0) {
            console.log(`Encontradas ${incidents.length} incidências. Deletando...`);
            const incIds = incidents.map(i => i.id);
            for (const id of incIds) {
                const { error: delError } = await supabase.from('mcs_incidents').delete().eq('id', id);
                if (delError) console.error(`Erro ao deletar incidência ${id}:`, delError);
            }
            console.log('Incidências deletadas com sucesso.');
        } else {
            console.log('Nenhuma incidência encontrada.');
        }

        console.log('--- Limpeza concluída! ---');
    } catch (err) {
        console.error('Erro durante o processo de limpeza:', err);
    }
}

clearData();
