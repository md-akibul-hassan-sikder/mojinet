import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function ApprovedOnlyRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasApproved, setHasApproved] = useState(false);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    api.get('/orders/my')
      .then((r) => setHasApproved(r.data.some((o) => o.status === 'approved')))
      .catch(() => setHasApproved(false))
      .finally(() => setChecking(false));
  }, [user]);

  if (authLoading || checking) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasApproved) return <Navigate to="/dashboard" replace />;
  return children;
}