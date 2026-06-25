import { useState, useCallback } from 'react';
import * as coachApi from '../services/coachApi';

export function useCoach() {
  const [brief, setBrief] = useState(null);
  const [review, setReview] = useState(null);
  const [weeklyReview, setWeeklyReview] = useState(null);
  const [scores, setScores] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [motivation, setMotivation] = useState(null);
  const [card, setCard] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBrief = useCallback(async (refresh) => {
    try { const res = await coachApi.getDailyBrief(refresh); if (res?.brief) setBrief(res.brief); return res?.brief; }
    catch { return null; }
  }, []);

  const loadReview = useCallback(async (refresh) => {
    try { const res = await coachApi.getDailyReview(refresh); if (res?.review) setReview(res.review); return res?.review; }
    catch { return null; }
  }, []);

  const loadWeekly = useCallback(async (refresh) => {
    try { const res = await coachApi.getWeeklyReview(refresh); if (res?.review) setWeeklyReview(res.review); return res?.review; }
    catch { return null; }
  }, []);

  const loadScores = useCallback(async () => {
    try { const res = await coachApi.getProductivityScores(); if (res?.scores) setScores(res.scores); return res?.scores; }
    catch { return null; }
  }, []);

  const loadRecommendations = useCallback(async () => {
    try { const res = await coachApi.getRecommendations(); if (res?.recommendations) setRecommendations(res.recommendations); return res?.recommendations; }
    catch { return null; }
  }, []);

  const loadMotivation = useCallback(async () => {
    try { const res = await coachApi.getMotivation(); if (res?.message) setMotivation(res); return res; }
    catch { return null; }
  }, []);

  const loadCard = useCallback(async () => {
    try { const res = await coachApi.getCoachCard(); if (res?.card) setCard(res.card); return res?.card; }
    catch { return null; }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await coachApi.getCoachDashboard();
      if (res) {
        setDashboard(res);
        if (res.card) setCard(res.card);
        if (res.recommendations) setRecommendations(res.recommendations);
        if (res.weeklyReview) setWeeklyReview(res.weeklyReview);
      }
      return res;
    } catch { return null; }
    finally { setLoading(false); }
  }, []);

  return {
    brief, review, weeklyReview, scores, recommendations, motivation, card, dashboard, loading,
    loadBrief, loadReview, loadWeekly, loadScores, loadRecommendations, loadMotivation, loadCard, loadDashboard,
  };
}
