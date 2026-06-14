import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoals } from '../hooks/useGoals';
import GoalForm from '../components/GoalForm';
import GoalCard from '../components/GoalCard';
import GoalDetail from '../components/GoalDetail';

export default function GoalsPage() {
  const {
    goals, activeGoals, completedGoals, create, createWithPlan, update, remove,
    complete, reactivate, showForm, setShowForm,
    editingGoal, setEditingGoal,
    addMilestone, toggleMilestone, removeMilestone, refresh,
  } = useGoals();
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const selectedGoal = selectedGoalId ? goals.find((g) => g.id === selectedGoalId) : null;

  if (selectedGoal) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <GoalDetail
            goal={selectedGoal}
            onBack={() => setSelectedGoalId(null)}
            onUpdate={(updates) => { update(selectedGoal.id, updates); }}
            onAddMilestone={(name) => { addMilestone(selectedGoal.id, name); }}
            onToggleMilestone={(msId) => { toggleMilestone(selectedGoal.id, msId); }}
            onRemoveMilestone={(msId) => { removeMilestone(selectedGoal.id, msId); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Goals</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">Track your long-term objectives</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Goal
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <GoalForm
              goal={editingGoal}
              onSubmit={(data) => {
                if (data.generatedPlan) {
                  createWithPlan(data, data.generatedPlan);
                } else if (editingGoal) {
                  update(editingGoal.id, data);
                } else {
                  create(data);
                }
                setShowForm(false);
                setEditingGoal(null);
              }}
              onCancel={() => { setShowForm(false); setEditingGoal(null); }}
            />
          )}
        </AnimatePresence>

        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Active Goals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={(g) => setSelectedGoalId(g.id)}
                  onEdit={(g) => { setEditingGoal(g); setShowForm(true); }}
                  onDelete={remove}
                  onComplete={complete}
                  onReactivate={reactivate}
                />
              ))}
            </div>
          </div>
        )}

        {completedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Completed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={(g) => setSelectedGoalId(g.id)}
                  onEdit={(g) => { setEditingGoal(g); setShowForm(true); }}
                  onDelete={remove}
                  onComplete={complete}
                  onReactivate={reactivate}
                />
              ))}
            </div>
          </div>
        )}

        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <p className="text-sm text-nexus-subtle/40">No Goals Yet</p>
            <p className="text-xs text-nexus-subtle/20 mt-1">Create your first goal to start tracking what matters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
