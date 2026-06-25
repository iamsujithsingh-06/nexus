import { useState } from 'react';
import { motion } from 'framer-motion';

const categories = [
  'Programming', 'Web Development', 'Artificial Intelligence', 'Machine Learning',
  'Data Structures', 'Algorithms', 'System Design', 'Cloud Computing',
  'DevOps', 'Database', 'Soft Skills', 'Career', 'Custom',
];

export default function CreateLearningModal({ onSubmit, onCancel }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Custom', difficulty: 'beginner',
    learningGoal: '', generatePlan: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (form.generatePlan) {
      setStep('generating');
    }

    await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
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
        {step === 'generating' && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" />
            <p className="text-sm text-white/70 font-medium">Generating your learning roadmap...</p>
            <p className="text-xs text-nexus-subtle/40 mt-1">Creating topic structure, milestones, and study plan</p>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-medium text-white/90">Create Learning Path</h2>
              <p className="text-xs text-nexus-subtle/40 mt-0.5">Define what you want to learn and Nexus will build a roadmap</p>
            </div>

            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Java, React, Machine Learning..."
                className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
                autoFocus
              />
            </div>

            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What do you want to achieve?"
                rows={2}
                className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs text-nexus-subtle/50 block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-2xs text-nexus-subtle/50 block mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-2xs text-nexus-subtle/50 block mb-1">Learning Goal (optional)</label>
              <input
                value={form.learningGoal}
                onChange={(e) => setForm(f => ({ ...f, learningGoal: e.target.value }))}
                placeholder="e.g., Build a full-stack app, Pass the interview..."
                className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.generatePlan}
                onChange={(e) => setForm(f => ({ ...f, generatePlan: e.target.checked }))}
                className="w-4 h-4 rounded border-white/10 bg-nexus-card/50 text-nexus-accent focus:ring-nexus-accent/30"
              />
              <span className="text-xs text-nexus-subtle/60">Auto-generate roadmap with AI</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs text-nexus-subtle/50 hover:text-nexus-subtle/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.title.trim()}
                className="px-4 py-2 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all disabled:opacity-40"
              >
                Create Path
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
