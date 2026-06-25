import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningApi } from '../hooks/useLearningApi';
import * as learningApi from '../services/learningApi';
import LearningStatistics from '../components/LearningStatistics';
import LearningCard from '../components/LearningCard';
import LearningFilters from '../components/LearningFilters';
import CreateLearningModal from '../components/CreateLearningModal';
import TopicCard from '../components/TopicCard';
import RoadmapView from '../components/RoadmapView';
import RevisionPanel from '../components/RevisionPanel';
import PracticeTracker from '../components/PracticeTracker';
import ContinueLearning from '../components/ContinueLearning';

export default function LearningPage() {
  const { paths, loading, dashboard, stats, loadDashboard, loadStats, create, update, remove } = useLearningApi();

  const [view, setView] = useState('dashboard');
  const [selectedPath, setSelectedPath] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({});
  const [filteredPaths, setFilteredPaths] = useState([]);
  const [pathDetail, setPathDetail] = useState(null);
  const [detailTopics, setDetailTopics] = useState([]);
  const [detailProblems, setDetailProblems] = useState([]);
  const [detailRevisions, setDetailRevisions] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [revisionsLoading, setRevisionsLoading] = useState(true);
  const [topicInput, setTopicInput] = useState('');

  useEffect(() => { loadDashboard(); loadStats(); }, [loadDashboard, loadStats]);

  useEffect(() => {
    learningApi.getDueRevisions().then(r => { if (r?.revisions) setRevisions(r.revisions); setRevisionsLoading(false); }).catch(() => setRevisionsLoading(false));
  }, []);

  useEffect(() => {
    let f = [...paths];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      f = f.filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (filters.category && filters.category !== 'All') f = f.filter(p => p.category === filters.category);
    if (filters.status && filters.status !== 'All') f = f.filter(p => p.status === filters.status);
    if (filters.sort === 'progress') f.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    else if (filters.sort === 'created') f.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    else f.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    setFilteredPaths(f);
  }, [paths, filters]);

  const handlePathClick = useCallback(async (path) => {
    setSelectedPath(path);
    setView('detail');
    const res = await learningApi.getLearningPath(path._id);
    if (res?.path) {
      setPathDetail(res.path);
      setDetailTopics(res.path.topics || []);
      setDetailProblems(res.path.practiceProblems || []);
      setDetailRevisions(res.path.revisionSchedules || []);
    }
  }, []);

  const handleCreatePath = async (data) => {
    const path = await create(data);
    setShowCreate(false);
    if (path) {
      loadStats();
      loadDashboard();
    }
  };

  const handleDeletePath = async (id) => {
    await remove(id);
    loadStats();
    loadDashboard();
  };

  const handleToggleTopic = async (topicId) => {
    const topic = detailTopics.find(t => t._id === topicId);
    if (!topic) return;
    const nextStatus = topic.status === 'completed' ? 'pending' : topic.status === 'in_progress' ? 'completed' : 'in_progress';
    const res = await learningApi.updateTopic(topicId, { status: nextStatus });
    if (res?.topic) {
      setDetailTopics(prev => prev.map(t => t._id === topicId ? res.topic : t));
      if (nextStatus === 'completed') {
        const refreshed = await learningApi.getLearningPath(selectedPath._id);
        if (refreshed?.path) setPathDetail(refreshed.path);
        loadStats();
      }
    }
  };

  const handleAddTopic = async () => {
    if (!topicInput.trim() || !selectedPath) return;
    const res = await learningApi.createTopic(selectedPath._id, { title: topicInput.trim() });
    if (res?.topic) {
      setDetailTopics(prev => [...prev, res.topic]);
      setTopicInput('');
      const refreshed = await learningApi.getLearningPath(selectedPath._id);
      if (refreshed?.path) setPathDetail(refreshed.path);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    await learningApi.deleteTopic(topicId);
    setDetailTopics(prev => prev.filter(t => t._id !== topicId));
    loadStats();
  };

  const handleAddProblem = async (data) => {
    const res = await learningApi.createPracticeProblem(data);
    if (res?.problem) setDetailProblems(prev => [res.problem, ...prev]);
  };

  const handleUpdateProblem = async (id, data) => {
    const res = await learningApi.updatePracticeProblem(id, data);
    if (res?.problem) setDetailProblems(prev => prev.map(p => p._id === id ? res.problem : p));
  };

  const handleDeleteProblem = async (id) => {
    await learningApi.deletePracticeProblem(id);
    setDetailProblems(prev => prev.filter(p => p._id !== id));
  };

  const handleCompleteRevision = async (id) => {
    await learningApi.completeRevision(id);
    setRevisions(prev => prev.filter(r => r._id !== id));
    loadStats();
  };

  // ── Detail View ──
  if (view === 'detail' && pathDetail) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => { setView('dashboard'); setSelectedPath(null); setPathDetail(null); }}
            className="flex items-center gap-1.5 text-xs text-nexus-subtle/50 hover:text-white/70 transition-all mb-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Learning
          </button>

          <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-medium text-white/90">{pathDetail.title}</h2>
                {pathDetail.description && <p className="text-xs text-nexus-subtle/50 mt-1">{pathDetail.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-2xs px-2 py-0.5 rounded bg-nexus-card/50 border border-white/[0.05] text-nexus-subtle/50">{pathDetail.category}</span>
                <span className="text-2xs px-2 py-0.5 rounded border border-white/[0.05] text-nexus-subtle/50">{pathDetail.difficulty}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-nexus-subtle/50">{pathDetail.progress || 0}% complete</span>
                <span className="text-2xs text-nexus-subtle/30">{pathDetail.actualHoursStudied || 0}h / {pathDetail.estimatedHours || '?'}h</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pathDetail.progress || 0}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-nexus-accent to-blue-400"
                  style={{ boxShadow: '0 0 8px rgba(96,165,250,0.15)' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => learningApi.recordStudyTime(pathDetail._id, 0.5).then(r => { if (r?.path) setPathDetail(r.path); })}
                className="text-2xs px-2.5 py-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 transition-all"
              >
                +30min Study
              </button>
              <button
                onClick={() => learningApi.recordStudyTime(pathDetail._id, 1).then(r => { if (r?.path) setPathDetail(r.path); })}
                className="text-2xs px-2.5 py-1.5 rounded-lg bg-nexus-card/30 border border-white/[0.05] text-nexus-subtle/50 hover:text-white/70 transition-all"
              >
                +1h Study
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Roadmap</h3>
                <RoadmapView milestones={pathDetail.milestones} topics={detailTopics} />
              </div>

              <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Topics ({detailTopics.filter(t => t.status === 'completed').length}/{detailTopics.length})</h3>
                <div className="space-y-1.5 mb-3">
                  {detailTopics.map(t => (
                    <TopicCard key={t._id} topic={t} onToggle={handleToggleTopic} onDelete={handleDeleteTopic} />
                  ))}
                  {detailTopics.length === 0 && (
                    <p className="text-2xs text-nexus-subtle/20 text-center py-4">No topics yet. AI will generate them when you create a path.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                    placeholder="Add topic..."
                    className="nexus-input flex-1 px-3 py-1.5 rounded-lg text-xs"
                  />
                  <button onClick={handleAddTopic} className="px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all shrink-0">
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5">
                <PracticeTracker
                  problems={detailProblems}
                  onAdd={handleAddProblem}
                  onUpdate={handleUpdateProblem}
                  onDelete={handleDeleteProblem}
                  pathId={pathDetail._id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard View ──
  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Learning</h1>
            <p className="text-xs text-nexus-subtle/40 mt-0.5">Track courses, topics, and study progress</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${view === 'dashboard' ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('browse')}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${view === 'browse' ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'}`}
            >
              Browse
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Path
            </button>
          </div>
        </div>

        {view === 'dashboard' && (
          <>
            <LearningStatistics stats={stats} loading={!stats} />

            {dashboard?.currentTopic && (
              <ContinueLearning
                currentTopic={dashboard.currentTopic}
                lastCompletedTopic={dashboard.lastCompletedTopic}
                activePaths={dashboard.activePaths}
                onNavigate={() => {}}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Active Paths</h3>
                  {dashboard?.activePaths && dashboard.activePaths.length > 0 ? (
                    <div className="space-y-2">
                      {dashboard.activePaths.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => {
                            const full = paths.find(x => x._id === p._id) || { _id: p._id, title: p.title, progress: p.progress };
                            handlePathClick(full);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-nexus-card/20 border border-white/[0.04] hover:border-white/[0.08] cursor-pointer transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white/80">{p.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 max-w-[100px] h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-nexus-accent to-blue-400" style={{ width: `${p.progress || 0}%` }} />
                              </div>
                              <span className="text-2xs text-nexus-subtle/40">{p.progress || 0}%</span>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-nexus-subtle/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-nexus-card/40 border border-white/[0.04] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                      </div>
                      <p className="text-xs text-nexus-subtle/40">No active learning paths</p>
                      <button onClick={() => setShowCreate(true)} className="mt-2 text-2xs text-nexus-accent/70 hover:text-nexus-accent transition-all">Create one</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Due Revisions</h3>
                  <RevisionPanel revisions={revisions} onComplete={handleCompleteRevision} loading={revisionsLoading} />
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'browse' && (
          <>
            <LearningFilters onFilter={setFilters} />

            {loading && filteredPaths.length === 0 && (
              <div className="text-center py-16">
                <span className="inline-block w-6 h-6 border-2 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" />
              </div>
            )}

            {!loading && filteredPaths.length > 0 && (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredPaths.map((p) => (
                    <LearningCard key={p._id} path={p} onClick={handlePathClick} onDelete={handleDeletePath} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && filteredPaths.length === 0 && paths.length > 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <p className="text-sm text-nexus-subtle/40">No paths match your filters</p>
              </div>
            )}

            {!loading && paths.length === 0 && (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-nexus-card/50 border border-white/[0.05] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <p className="text-sm text-nexus-subtle/60 font-medium">No Learning Paths Yet</p>
                <p className="text-xs text-nexus-subtle/20 mt-1">Create your first learning path to start tracking your education.</p>
                <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all">
                  Create Your First Path
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateLearningModal onSubmit={handleCreatePath} onCancel={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
