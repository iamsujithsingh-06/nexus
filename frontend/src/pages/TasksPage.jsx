import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTasksApi } from '../hooks/useTasksApi';
import * as goalApi from '../services/goalApi';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';

function normalizeTask(t) {
  return {
    ...t,
    id: t._id || t.id,
    status: t.status === 'completed' ? 'Completed' : t.status === 'pending' ? 'Pending' : t.status,
  };
}

export default function TasksPage() {
  const { tasks, create, update, remove, toggle, loading } = useTasksApi();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [apiGoals, setApiGoals] = useState([]);

  useEffect(() => {
    goalApi.getGoals().then(res => {
      if (res?.goals) setApiGoals(res.goals);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (data) => {
    if (editingTask) {
      await update(editingTask._id || editingTask.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  // Merge API goals for TaskForm (falls back to localStorage)
  const formGoals = apiGoals.filter(g => g.status === 'active');

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Tasks</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">Manage your daily to-dos</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Task
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <TaskForm
              task={editingTask ? normalizeTask(editingTask) : null}
              goals={formGoals}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
            />
          )}
        </AnimatePresence>

        {loading && tasks.length === 0 && (
          <div className="text-center py-12">
            <span className="inline-block w-6 h-6 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" />
          </div>
        )}

        {!loading && tasks.length > 0 ? (
          <div className="space-y-1.5">
            {tasks.map((task) => {
              const normal = normalizeTask(task);
              return (
                <TaskItem
                  key={normal.id}
                  task={normal}
                  onToggle={(id) => toggle(id)}
                  onEdit={(t) => { setEditingTask(task); setShowForm(true); }}
                  onDelete={(id) => remove(id)}
                />
              );
            })}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <p className="text-sm text-nexus-subtle/40">No Tasks Yet</p>
            <p className="text-xs text-nexus-subtle/20 mt-1">Create your first task to start tracking your progress.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
