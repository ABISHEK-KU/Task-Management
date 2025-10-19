import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI, usersAPI } from '../services/api';

interface TaskData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo: string;
  tags: string[];
}

const BulkCreateTasks: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskData[]>([
    {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      tags: []
    }
  ]);
  const [tagInputs, setTagInputs] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<{ _id: string; username: string }[]>([]);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      setUsers(response.data);
    } catch (err: unknown) {
      const error = err as any;
      console.error('Failed to fetch users:', error.response?.data?.message || error.message);
      // Fallback to empty array if API fails
      setUsers([]);
    }
  };

  const addTask = () => {
    setTasks([...tasks, {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      tags: []
    }]);
    setTagInputs([...tagInputs, '']);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    setTagInputs(tagInputs.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof TaskData, value: any) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const updateTagInput = (taskIndex: number, value: string) => {
    const updatedInputs = [...tagInputs];
    updatedInputs[taskIndex] = value;
    setTagInputs(updatedInputs);
  };

  const addTag = (taskIndex: number) => {
    const tagInput = tagInputs[taskIndex];
    if (tagInput.trim() && !tasks[taskIndex].tags.includes(tagInput.trim())) {
      updateTask(taskIndex, 'tags', [...tasks[taskIndex].tags, tagInput.trim()]);
      updateTagInput(taskIndex, '');
    }
  };

  const removeTag = (taskIndex: number, tagToRemove: string) => {
    updateTask(taskIndex, 'tags', tasks[taskIndex].tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tasks
    const validTasks = tasks.filter(task => task.title.trim());
    if (validTasks.length === 0) {
      setError('At least one task with a title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await tasksAPI.bulkCreateTasks({ tasks: validTasks });
      navigate('/tasks');
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to create tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-create">
      <h1>Bulk Create Tasks</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {tasks.map((task, index) => (
          <div key={index} className="task-card">
            <div className="task-header">
              <h3>Task {index + 1}</h3>
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTask(index)}
                  className="btn-danger"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`title-${index}`}>Title *</label>
                <input
                  type="text"
                  id={`title-${index}`}
                  value={task.title}
                  onChange={(e) => updateTask(index, 'title', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`status-${index}`}>Status</label>
                <select
                  id={`status-${index}`}
                  value={task.status}
                  onChange={(e) => updateTask(index, 'status', e.target.value as TaskData['status'])}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={`description-${index}`}>Description</label>
              <textarea
                id={`description-${index}`}
                value={task.description}
                onChange={(e) => updateTask(index, 'description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`priority-${index}`}>Priority</label>
                <select
                  id={`priority-${index}`}
                  value={task.priority}
                  onChange={(e) => updateTask(index, 'priority', e.target.value as TaskData['priority'])}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={`dueDate-${index}`}>Due Date</label>
                <input
                  type="date"
                  id={`dueDate-${index}`}
                  value={task.dueDate}
                  onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor={`assignedTo-${index}`}>Assigned To</label>
                <select
                  id={`assignedTo-${index}`}
                  value={task.assignedTo}
                  onChange={(e) => updateTask(index, 'assignedTo', e.target.value)}
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tags-input">
                <input
                  type="text"
                  value={tagInputs[index]}
                  onChange={(e) => updateTagInput(index, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(index))}
                  placeholder="Add a tag and press Enter"
                />
                <button type="button" onClick={() => addTag(index)} className="btn-secondary">
                  Add Tag
                </button>
              </div>
              <div className="tags-list">
                {task.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(index, tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="bulk-actions">
          <button type="button" onClick={addTask} className="btn-secondary">
            Add Another Task
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating Tasks...' : 'Create Tasks'}
          </button>
          <button type="button" onClick={() => navigate('/tasks')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkCreateTasks;
