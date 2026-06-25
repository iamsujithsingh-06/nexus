import { useState } from 'react';
import { motion } from 'framer-motion';

const categories = ['Web Development', 'AI', 'Machine Learning', 'Mobile', 'Game Development', 'Research', 'Personal', 'Business', 'Open Source', 'Other'];

export default function CreateProjectModal({ onSubmit, onCancel, initial }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    category: initial?.category || 'Other',
    priority: initial?.priority || 'medium',
    status: initial?.status || 'active',
    startDate: initial?.startDate || '',
    targetDate: initial?.targetDate || '',
    version: initial?.version || 'v1.0',
    techStack: initial?.techStack?.join(', ') || '',
    tags: initial?.tags?.join(', ') || '',
    notes: initial?.notes || '',
    repoUrl: initial?.repoUrl || '',
    liveUrl: initial?.liveUrl || '',
    docsUrl: initial?.docsUrl || '',
    owner: initial?.owner || '',
    estimatedHours: initial?.estimatedHours || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      title: form.title.trim(),
      techStack: form.techStack ? form.techStack.split(',').map(t => t.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours, 10) : 0,
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
        className="w-full max-w-2xl mx-4 rounded-2xl bg-nexus-card border border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-white/90">{initial ? 'Edit Project' : 'New Project'}</h2>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">{initial ? 'Update project details' : 'Create a new project'}</p>
          </div>

          <div>
            <label className="text-2xs text-nexus-subtle/50 block mb-1">Title *</label>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Project name" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" autoFocus />
          </div>

          <div>
            <label className="text-2xs text-nexus-subtle/50 block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm">
                <option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Target Date</label>
              <input type="date" value={form.targetDate} onChange={(e) => setForm(f => ({ ...f, targetDate: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Version</label>
              <input value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} placeholder="v1.0" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Est. Hours</label>
              <input type="number" min="0" value={form.estimatedHours} onChange={(e) => setForm(f => ({ ...f, estimatedHours: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-2xs text-nexus-subtle/50 block mb-1">Tech Stack (comma separated)</label>
            <input value={form.techStack} onChange={(e) => setForm(f => ({ ...f, techStack: e.target.value }))} placeholder="e.g., React, Node.js, MongoDB" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Repository URL</label>
              <input value={form.repoUrl} onChange={(e) => setForm(f => ({ ...f, repoUrl: e.target.value }))} placeholder="https://github.com/..." className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Live URL</label>
              <input value={form.liveUrl} onChange={(e) => setForm(f => ({ ...f, liveUrl: e.target.value }))} placeholder="https://..." className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Docs URL</label>
              <input value={form.docsUrl} onChange={(e) => setForm(f => ({ ...f, docsUrl: e.target.value }))} placeholder="https://..." className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g., fullstack, api" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Owner</label>
              <input value={form.owner} onChange={(e) => setForm(f => ({ ...f, owner: e.target.value }))} className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-2xs text-nexus-subtle/50 block mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-xs text-nexus-subtle/50 hover:text-nexus-subtle/80 transition-colors">Cancel</button>
            <button type="submit" disabled={!form.title.trim()} className="px-4 py-2 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all disabled:opacity-40">
              {initial ? 'Save' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
