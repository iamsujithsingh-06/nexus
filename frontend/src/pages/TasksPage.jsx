import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';

export default function TasksPage() {
  const { tasks, create, toggleStatus, update, remove } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
              task={editingTask}
              onSubmit={(data) => {
                if (editingTask) {
                  update(editingTask.id, data);
                } else {
                  create(data);
                }
                setShowForm(false);
                setEditingTask(null);
              }}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
            />
          )}
        </AnimatePresence>

        {tasks.length > 0 ? (
          <div className="space-y-1.5">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleStatus}
                onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                onDelete={remove}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <p className="text-sm text-nexus-subtle/40">No Tasks Yet</p>
            <p className="text-xs text-nexus-subtle/20 mt-1">Create your first task to start tracking your progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
