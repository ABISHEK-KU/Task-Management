import React, { useEffect, useState } from "react";
import { analyticsAPI } from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface OverviewStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

interface PerformanceMetrics {
  userId: string;
  username: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

interface TrendData {
  date: string;
  completed: number;
  created: number;
}

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, performanceRes, trendsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getPerformance(),
        analyticsAPI.getTrends(),
      ]);

      console.log("Performance API Response:", performanceRes.data);

      setOverview(overviewRes.data);

      // ✅ Ensure it's always an array
      const perfData = Array.isArray(performanceRes.data)
        ? performanceRes.data
        : performanceRes.data?.users || [];

      const trendsData = Array.isArray(trendsRes.data)
        ? trendsRes.data
        : trendsRes.data?.trends || [];

      setPerformance(perfData);
      setTrends(trendsData);
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await analyticsAPI.exportTasks(format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tasks.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || "Failed to export data");
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // ---------- Chart Data ----------
  const statusData = {
    labels: ["Completed", "In Progress", "Pending", "Overdue"],
    datasets: [
      {
        data: [
          overview?.completedTasks || 0,
          overview?.inProgressTasks || 0,
          overview?.pendingTasks || 0,
          overview?.overdueTasks || 0,
        ],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  const trendsChartData = {
    labels: trends.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: "Tasks Created",
        data: trends.map((t) => t.created),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.1,
      },
      {
        label: "Tasks Completed",
        data: trends.map((t) => t.completed),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        tension: 0.1,
      },
    ],
  };

  const performanceChartData = {
    labels: Array.isArray(performance)
      ? performance.map((p) => p.username)
      : [],
    datasets: [
      {
        label: "Completion Rate (%)",
        data: Array.isArray(performance)
          ? performance.map((p) => p.completionRate)
          : [],
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="analytics">
      <h1>Analytics & Reports</h1>

      <div className="export-actions">
        <button onClick={() => handleExport("csv")} className="btn-secondary">
          Export CSV
        </button>
        <button onClick={() => handleExport("json")} className="btn-secondary">
          Export JSON
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{overview?.totalTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number completed">
            {overview?.completedTasks || 0}
          </p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number in-progress">
            {overview?.inProgressTasks || 0}
          </p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{overview?.pendingTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Overdue</h3>
          <p className="stat-number overdue">{overview?.overdueTasks || 0}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <Doughnut data={statusData} />
        </div>

        <div className="chart-card">
          <h3>Task Trends (Last 30 Days)</h3>
          <Line data={trendsChartData} />
        </div>

        <div className="chart-card">
          <h3>User Performance</h3>
          <Bar data={performanceChartData} />
        </div>
      </div>

      <div className="performance-table">
        <h3>Detailed Performance Metrics</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Total Tasks</th>
              <th>Completed</th>
              <th>Completion Rate</th>
              <th>Avg. Completion Time (days)</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(performance) &&
              performance.map((user) => (
                <tr key={user.userId}>
                  <td>{user.username}</td>
                  <td>{user.totalTasks}</td>
                  <td>{user.completedTasks}</td>
                  <td>{user.completionRate.toFixed(1)}%</td>
                  <td>{user.averageCompletionTime.toFixed(1)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
