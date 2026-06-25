import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasksApi } from '../hooks/useTasksApi';
import TasksDashboard from '../components/TasksDashboard';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';
import TaskStatistics from '../components/TaskStatistics';
import CreateTaskModal from '../components/CreateTaskModal';

export default function TasksPage() {
  const {
    tasks, loading, dashboard, stats, dailyPlan,
    loadDashboard, loadStats, loadDailyPlan,
    create, update, remove, toggle,
    pendingTasks, completedTasks, todayTasks, overdueTasks,
  } = useTasksApi();

  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'All', status: 'All', priority: 'All' });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadDashboard().then(() => setDashboardLoading(false));
    loadStats().then(() => setStatsLoading(false));
    loadDailyPlan();
  }, [loadDashboard, loadStats, loadDailyPlan]);

  const filteredTasks = useMemo(() => {
    return pendingTasks.filter(t => {
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase()) && !t.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category !== 'All' && t.category !== filters.category) return false;
      if (filters.status !== 'All') {
        if (filters.status === 'in_progress' && t.status !== 'in_progress') return false;
        if (filters.status === 'pending' && t.status !== 'pending') return false;
        if (filters.status === 'completed' && t.status !== 'completed') return false;
      }
      if (filters.priority !== 'All' && t.priority !== filters.priority) return false;
      return true;
    });
  }, [pendingTasks, filters]);

  const handleCreate = useCallback(async (data) => {
    const res = await create(data);
    if (res) { setShowCreate(false); setEditingTask(null); }
  }, [create]);

  const handleEdit = useCallback(async (data) => {
    const res = await update(editingTask._id, data);
    if (res) { setShowCreate(false); setEditingTask(null); }
  }, [update, editingTask]);

  const handleToggle = useCallback(async (id) => {
    await toggle(id);
    loadDashboard();
    loadStats();
  }, [toggle, loadDashboard, loadStats]);

  const handleDelete = useCallback(async (id) => {
    await remove(id);
    loadDashboard();
    loadStats();
  }, [remove, loadDashboard, loadStats]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Tasks</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">Manage, track, and complete your daily tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(s => !s)}
              className={`p-2 rounded-lg border transition-all ${showStats ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/70' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/30 hover:text-white/60'}`}
              title="Statistics"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
            </button>
            <button
              onClick={() => setShowPlan(s => !s)}
              className={`p-2 rounded-lg border transition-all ${showPlan ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/70' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/30 hover:text-white/60'}`}
              title="Daily Plan"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Task
            </button>
          </div>
        </div>

        <TasksDashboard data={dashboard} loading={dashboardLoading} />

        <AnimatePresence>
          {showStats && <motion.div key="stats" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><TaskStatistics stats={stats} loading={statsLoading} /></motion.div>}
          {showPlan && dailyPlan && dailyPlan.length > 0 && (
            <motion.div key="plan" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-5">
              <div className="bg-nexus-card/40 border border-nexus-accent/15 rounded-xl p-4">
                <h3 className="text-xs font-medium text-nexus-accent/70 uppercase tracking-wider mb-3">Today's Plan</h3>
                <div className="space-y-1.5">
                  {dailyPlan.map((t, i) => (
                    <div key={t._id || i} className="flex items-center gap-2.5 text-xs text-white/70 py-1">
                      <span className="w-5 h-5 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center text-2xs text-nexus-accent/70 shrink-0">{i + 1}</span>
                      <span className="flex-1">{t.title}</span>
                      {t.priority && <span className={`text-2xs px-1.5 py-0.5 rounded border ${t.priority === 'critical' ? 'text-rose-400/70 border-rose-500/20' : t.priority === 'high' ? 'text-orange-400/70 border-orange-500/20' : 'text-nexus-subtle/30 border-white/[0.04]'}`}>{t.priority}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TaskFilters onFilter={setFilters} />

        {loading && tasks.length === 0 && (
          <div className="text-center py-12"><span className="inline-block w-6 h-6 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" /></div>
        )}

        {!loading && (
          <div className="space-y-6">
            {overdueTasks.length > 0 && (
              <Section title="Overdue" count={overdueTasks.length} color="rose">
                {overdueTasks.map(t => <TaskCard key={t._id} task={t} onToggle={handleToggle} onEdit={(t) => { setEditingTask(t); setShowCreate(true); }} onDelete={handleDelete} />)}
              </Section>
            )}
            {todayTasks.length > 0 && (
              <Section title="Today" count={todayTasks.length} color="amber">
                {todayTasks.map(t => <TaskCard key={t._id} task={t} onToggle={handleToggle} onEdit={(t) => { setEditingTask(t); setShowCreate(true); }} onDelete={handleDelete} />)}
              </Section>
            )}

            <Section title="All Pending" count={filteredTasks.length} color="blue">
              {filteredTasks.length > 0
                ? filteredTasks.filter(t => !overdueTasks.find(o => o._id === t._id) && !todayTasks.find(d => d._id === t._id)).map(t => <TaskCard key={t._id} task={t} onToggle={handleToggle} onEdit={(t) => { setEditingTask(t); setShowCreate(true); }} onDelete={handleDelete} />)
                : (
                  <div className="text-center py-8">
                    <p className="text-sm text-nexus-subtle/40">No pending tasks match your filters</p>
                    <p className="text-xs text-nexus-subtle/20 mt-1">Adjust filters or create a new task</p>
                  </div>
                )}
            </Section>

            {completedTasks.length > 0 && (
              <Section title="Completed" count={completedTasks.length} color="emerald">
                {completedTasks.slice(0, 10).map(t => <TaskCard key={t._id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
                {completedTasks.length > 10 && (
                  <p className="text-xs text-center text-nexus-subtle/30 py-2">+{completedTasks.length - 10} more completed tasks</p>
                )}
              </Section>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateTaskModal
            key={editingTask?._id || 'new'}
            initial={editingTask}
            onSubmit={editingTask ? handleEdit : handleCreate}
            onCancel={() => { setShowCreate(false); setEditingTask(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, count, color, children }) {
  const colorMap = { rose: 'border-rose-500/20', amber: 'border-amber-500/20', blue: 'border-nexus-accent/20', emerald: 'border-emerald-500/20' };
  const dotMap = { rose: 'bg-rose-400', amber: 'bg-amber-400', blue: 'bg-nexus-accent', emerald: 'bg-emerald-400' };
  return (
    <div className="bg-nexus-card/20 border border-white/[0.04] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-1.5 h-1.5 rounded-full ${dotMap[color] || dotMap.blue}`} />
        <h2 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">{title}</h2>
        <span className="text-2xs text-nexus-subtle/30 ml-auto">{count}</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
