import { useState } from 'react';
import { motion } from 'framer-motion';

const categories = ['coding', 'learning', 'workout', 'reading', 'project', 'career', 'health', 'finance', 'general'];

export default function CreateTaskModal({ onSubmit, onCancel, initial }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    priority: initial?.priority || 'medium',
    category: initial?.category || 'general',
    dueDate: initial?.dueDate || '',
    estimatedTime: initial?.estimatedTime || '',
    notes: initial?.notes || '',
    tags: initial?.tags?.join(', ') || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      title: form.title.trim(),
      estimatedTime: form.estimatedTime ? parseInt(form.estimatedTime, 10) : 0,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg mx-4 rounded-2xl bg-nexus-card border border-white/[0.08] shadow-2xl overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-white/90">{initial ? 'Edit Task' : 'Create Task'}</h2>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">{initial ? 'Update task details' : 'Add a new task to your list'}</p>
          </div>

          <div>
            <label className="text-2xs text-nexus-subtle/50 block mb-1">Title *</label>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" autoFocus />
          </div>

          <div>
            <label className="text-2xs text-nexus-subtle/50 block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Est. Time (min)</label>
              <input type="number" min="0" value={form.estimatedTime} onChange={(e) => setForm(f => ({ ...f, estimatedTime: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-2xs text-nexus-subtle/50 block mb-1">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g., urgent, backend, review" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-xs text-nexus-subtle/50 hover:text-nexus-subtle/80 transition-colors">Cancel</button>
            <button type="submit" disabled={!form.title.trim()} className="px-4 py-2 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all disabled:opacity-40">
              {initial ? 'Save' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
