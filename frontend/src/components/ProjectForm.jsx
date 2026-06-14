import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT_CATEGORIES } from '../services/projectService';

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setCategory(project.category || 'Other');
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-nexus-card/60 border border-white/[0.06] rounded-xl p-5 mb-4"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <h3 className="text-sm font-medium text-white/80">
            {project ? 'Edit Project' : 'New Project'}
          </h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
          >
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-nexus-subtle/50 hover:text-nexus-subtle/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
            >
              {project ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
