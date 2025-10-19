import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { tasksAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ConfirmationDialog from "./ConfirmationDialog";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  assignedTo: {
    _id: string;
    username: string;
  };
  tags: string[];
  createdBy: {
    _id: string;
    username: string;
  };
}

interface TaskListProps {
  filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
  };
}

const TaskList: React.FC<TaskListProps> = ({ filters = {} }) => {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const tasksPerPage = 10;
  const lastFiltersRef = useRef<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null
  });

  const fetchTasks = async () => {
    try {
      const params = {
        ...filters,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        page,
        limit: tasksPerPage
      };
      const response = await tasksAPI.getAll(params);
      setAllTasks(response.data.tasks);
      setTasks(response.data.tasks);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    const taskId = task?._id;
    try {
      await tasksAPI.updateTask(task._id, { status: newStatus as Task["status"] });
      setAllTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? { ...task, status: newStatus as "todo" | "in-progress" | "review" | "done" }
            : task
        )
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? { ...task, status: newStatus as "todo" | "in-progress" | "review" | "done" }
            : task
        )
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update task status");
    }
  };

  useEffect(() => {
    const filtersStr = JSON.stringify(filters);
    if (filtersStr !== lastFiltersRef.current) {
      lastFiltersRef.current = filtersStr;
      setPage(1); // Reset to first page when filters change
      fetchTasks();
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [searchTerm, sortBy, sortOrder, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleDeleteTask = async () => {
    if (!deleteDialog.taskId) return;

    try {
      await tasksAPI.deleteTask(deleteDialog.taskId);
      setDeleteDialog({ isOpen: false, taskId: null });
      fetchTasks();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete task");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "status-completed";
      case "in-progress":
        return "status-in-progress";
      case "review":
        return "status-review";
      case "todo":
        return "status-pending";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "priority-urgent";
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const totalPages = Math.ceil(allTasks.length / tasksPerPage);

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Tasks</h2>
        <div className="task-list-actions">
          <Link to="/tasks/new" className="btn-secondary">
            Create Task
          </Link>
          <Link to="/tasks/bulk" className="btn-primary">
            Bulk Create Tasks
          </Link>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="task-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="sort-container">
          <button
            onClick={() => handleSortChange('createdAt')}
            className={`sort-btn ${sortBy === 'createdAt' ? 'active' : ''}`}
          >
            Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('priority')}
            className={`sort-btn ${sortBy === 'priority' ? 'active' : ''}`}
          >
            Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('dueDate')}
            className={`sort-btn ${sortBy === 'dueDate' ? 'active' : ''}`}
          >
            Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found.</p>
          <Link to="/tasks/new" className="btn-primary">
            Create your first task
          </Link>
        </div>
      ) : (
        <>
          <div className="task-grid">
            {tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h3>
                    <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                  </h3>
                  <div className="task-actions">
                    {(() => {
                      return (
                        <>
                          {(user?.id === task?.createdBy._id ||
                            user?.role === "admin") && (
                            <>
                              <Link
                                to={`/tasks/${task._id}/edit`}
                                className="btn-edit"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => setDeleteDialog({ isOpen: true, taskId: task._id })}
                                className="btn-danger"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {user?.id === task.assignedTo._id ||
                          user?.role === "admin" ? (
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(task, e.target.value)
                              }
                              className="status-select"
                            >
                              <option value="todo">Todo</option>
                              <option value="in-progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          ) : (
                            <span
                              className={`status-badge ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-meta">
                  <span
                    className={`priority-badge ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span>Assigned to: {task.assignedTo.username}</span>
                </div>
                {task.tags.length > 0 && (
                  <div className="task-tags">
                    {task.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteDialog({ isOpen: false, taskId: null })}
      />
    </div>
  );
};

export default TaskList;
