import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { analyticsAPI } from "../services/api";

interface Stats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsAPI.getOverview();
        setStats(response.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.firstName}!</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats?.totalTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number completed">{stats?.completedTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number in-progress">
            {stats?.inProgressTasks || 0}
          </p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{stats?.pendingTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Overdue</h3>
          <p className="stat-number overdue">{stats?.overdueTasks || 0}</p>
        </div>
      </div>
      <div className="quick-actions">
        <Link to="/tasks/new" className="btn-primary">
          Create New Task
        </Link>
        <Link to="/tasks/bulk" className="btn-secondary">
          Bulk Create Tasks
        </Link>
        <Link to="/tasks" className="btn-secondary">
          View All Tasks
        </Link>
        <Link to="/analytics" className="btn-secondary">
          View Analytics
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
