import { useState, useEffect } from 'react';
import {
  getMyContributions,
  getPendingContributions,
  getContributorStats,
  createContribution,
  updateContribution,
  submitContribution,
  approveContribution,
  rejectContribution,
  deleteContribution,
  countPendingContributions
} from '../data/contributions';

/**
 * ============================================================================
 * HOOK : useContributions
 * Gestion des contributions d'un utilisateur
 * ============================================================================
 */
export function useContributions(userId, filters = {}) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContributions = async () => {
    setLoading(true);
    setError(null);

    const result = await getMyContributions(userId, filters);

    if (result.success) {
      setContributions(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchContributions();
    }
  }, [userId, JSON.stringify(filters)]);

  return {
    contributions,
    loading,
    error,
    refresh: fetchContributions
  };
}

/**
 * ============================================================================
 * HOOK : useContributorStats
 * Récupération des statistiques d'un contributeur
 * ============================================================================
 */
export function useContributorStats(userId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    const result = await getContributorStats(userId);

    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}

/**
 * ============================================================================
 * HOOK : usePendingContributions (Admin)
 * Récupération des contributions en attente de validation
 * ============================================================================
 */
export function usePendingContributions(filters = {}) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const fetchPendingContributions = async () => {
    setLoading(true);
    setError(null);

    const result = await getPendingContributions(filters);

    if (result.success) {
      setContributions(result.data);
      setCount(result.data.length);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPendingContributions();
  }, [JSON.stringify(filters)]);

  return {
    contributions,
    count,
    loading,
    error,
    refresh: fetchPendingContributions
  };
}

/**
 * ============================================================================
 * HOOK : useContributionActions
 * Actions CRUD sur les contributions
 * ============================================================================
 */
export function useContributionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (userId, type, content) => {
    setLoading(true);
    setError(null);

    const result = await createContribution(userId, type, content);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const update = async (contributionId, updates) => {
    setLoading(true);
    setError(null);

    const result = await updateContribution(contributionId, updates);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const submit = async (contributionId) => {
    setLoading(true);
    setError(null);

    const result = await submitContribution(contributionId);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const remove = async (contributionId) => {
    setLoading(true);
    setError(null);

    const result = await deleteContribution(contributionId);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const approve = async (contributionId, reviewerId, modifications = null) => {
    setLoading(true);
    setError(null);

    const result = await approveContribution(contributionId, reviewerId, modifications);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const reject = async (contributionId, reviewerId, reason) => {
    setLoading(true);
    setError(null);

    const result = await rejectContribution(contributionId, reviewerId, reason);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  return {
    loading,
    error,
    create,
    update,
    submit,
    remove,
    approve,
    reject
  };
}

/**
 * ============================================================================
 * HOOK : usePendingCount (pour badges admin)
 * Compte les contributions en attente
 * ============================================================================
 */
export function usePendingCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    setLoading(true);
    const result = await countPendingContributions();
    if (result.success) {
      setCount(result.count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCount();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    count,
    loading,
    refresh: fetchCount
  };
}
