import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GOAL_CATEGORIES, GOAL_PRIORITIES, generateAIPlan } from '../services/goalService';

export default function GoalForm({ goal, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('Medium');
  const [targetDate, setTargetDate] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setCategory(goal.category || 'Personal');
      setPriority(goal.priority || 'Medium');
      setTargetDate(goal.targetDate ? goal.targetDate.slice(0, 10) : '');
    }
  }, [goal]);

  const handleGenerate = () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const plan = generateAIPlan({
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate || null,
      });
      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      targetDate: targetDate || null,
      generatedPlan,
    });
  };

  const totalTasks = generatedPlan
    ? generatedPlan.milestones.reduce((sum, m) => sum + m.taskTitles.length, 0)
    : 0;

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
            {goal ? 'Edit Goal' : 'New Goal'}
          </h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title"
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
          <div className="grid grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="nexus-input px-3 py-2 rounded-lg text-sm"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="nexus-input px-3 py-2 rounded-lg text-sm"
            >
              {GOAL_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-2xs text-nexus-subtle/40 block mb-1">Target Date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="nexus-input w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>

          {!goal && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !title.trim()}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border transition-all w-full justify-center ${
                  generatedPlan
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80'
                    : 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80 hover:bg-nexus-accent/20'
                } ${(!title.trim() || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" />
                    Generating Plan...
                  </>
                ) : generatedPlan ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Plan Generated — Regenerate
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    AI Generate Plan
                  </>
                )}
              </button>
            </div>
          )}

          {generatedPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-nexus-card/40 border border-white/[0.04] rounded-xl overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-white/[0.03] flex items-center justify-between">
                <span className="text-xs font-medium text-nexus-subtle/60">
                  Generated Plan — {generatedPlan.milestones.length} milestones, {totalTasks} tasks
                </span>
                <span className="text-2xs px-1.5 py-0.5 rounded bg-nexus-accent/10 text-nexus-accent/60 capitalize">{generatedPlan.domain}</span>
              </div>
              <div className="p-3 space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {generatedPlan.milestones.map((ms, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs">{(i + 1).toString().padStart(2, '0')}</span>
                      <span className="text-xs font-medium text-white/80">{ms.name}</span>
                      <span className="text-2xs text-nexus-subtle/30 ml-auto">{ms.taskTitles.length} tasks</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ms.taskTitles.map((t, j) => (
                        <span key={j} className="text-2xs px-1.5 py-0.5 bg-white/[0.03] text-nexus-subtle/40 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

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
              className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                generatedPlan
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80 hover:bg-emerald-500/20'
                  : 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80 hover:bg-nexus-accent/20'
              }`}
            >
              {goal ? 'Save' : generatedPlan ? 'Create with AI Plan' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
