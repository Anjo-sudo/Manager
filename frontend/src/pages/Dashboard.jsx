import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setMetrics(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!metrics) return <div>Error loading dashboard</div>;

  return (
    <div>
      <div className="header-flex">
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome back, {user.name}!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card stat-card" onClick={() => navigate('/projects')} style={{ borderTopColor: 'var(--primary)', cursor: 'pointer' }}>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={18} color="var(--primary)" /> Total Tasks
          </div>
          <div className="stat-value">{metrics.totalTasks}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.7 }}>View Projects <ArrowRight size={12} /></div>
        </div>
        <div className="glass-card stat-card" onClick={() => navigate('/projects')} style={{ borderTopColor: 'var(--success)', cursor: 'pointer' }}>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--success)" /> Tasks Done
          </div>
          <div className="stat-value">{metrics.tasksByStatus['Done'] || 0}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.7 }}>View Projects <ArrowRight size={12} /></div>
        </div>
        <div className="glass-card stat-card" onClick={() => navigate('/projects')} style={{ borderTopColor: 'var(--warning)', cursor: 'pointer' }}>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--warning)" /> Assigned to You
          </div>
          <div className="stat-value">{metrics.myTasks}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.7 }}>View Projects <ArrowRight size={12} /></div>
        </div>
        <div className="glass-card stat-card" onClick={() => navigate('/projects')} style={{ borderTopColor: 'var(--danger)', cursor: 'pointer' }}>
          <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--danger)" /> Overdue Tasks
          </div>
          <div className="stat-value" style={{ color: metrics.overdueTasks > 0 ? 'var(--danger)' : 'inherit' }}>{metrics.overdueTasks}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.7 }}>View Projects <ArrowRight size={12} /></div>
        </div>
      </div>

      <div className="glass-card card">
        <h3 className="card-title">Welcome to SyncTask!</h3>
        <p className="card-desc">
          Navigate to "Projects" to start creating projects, adding team members, and assigning tasks.
          As an Admin, you can manage the entire project lifecycle. As a Member, you can update the status of tasks assigned to you.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
