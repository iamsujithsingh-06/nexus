import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TASK_CATEGORIES } from '../services/taskService';
import { getAllGoals } from '../services/goalService';

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState('');
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    setGoals(getAllGoals().filter((g) => g.status === 'Active'));
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || 'Other');
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
      setGoalId(task.goalId || '');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      dueDate: dueDate || null,
      goalId: goalId || null,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-nexus-card/60 border border-white/[0.06] rounded-xl p-4 mb-3"
      >
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <h3 className="text-sm font-medium text-white/80">
            {task ? 'Edit Task' : 'New Task'}
          </h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="nexus-input px-3 py-2 rounded-lg text-sm"
            >
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="nexus-input px-3 py-2 rounded-lg text-sm"
            />
          </div>
          {goals.length > 0 && (
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
            >
              <option value="">No goal linked</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-nexus-subtle/50 hover:text-nexus-subtle/80 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all">
              {task ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
