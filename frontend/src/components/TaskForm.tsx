import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tasksAPI, usersAPI } from "../services/api";

interface TaskFormData {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  assignedTo: string;
  tags: string[];
}

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<{ _id: string; username: string }[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [fieldTouched, setFieldTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchUsers();

    if (isEditing && id) {
      fetchTask();
    }
  }, [id, isEditing]);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      setUsers(response.data);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(
        "Failed to fetch users:",
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message
      );
      // Fallback to empty array if API fails
      setUsers([]);
    }
  };

  const fetchTask = async () => {
    try {
      const response = await tasksAPI.getTask(id!);
      const task = response.data;
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: new Date(task.dueDate).toISOString().split("T")[0],
        assignedTo: task.assignedTo._id,
        tags: task.tags,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to load task");
    }
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "title":
        if (!value.trim()) error = "Title is required";
        else if (value.length < 3) error = "Title must be at least 3 characters";
        break;
      case "description":
        if (!value.trim()) error = "Description is required";
        else if (value.length < 10) error = "Description must be at least 10 characters";
        break;
      case "dueDate":
        if (!value) error = "Due date is required";
        else if (new Date(value) < new Date()) error = "Due date cannot be in the past";
        break;
      case "assignedTo":
        if (!value) error = "Please select a user to assign the task";
        break;
      default:
        break;
    }
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
    setFieldTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    validateField(name, value);
    setFieldTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const errors: { [key: string]: string } = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "status" && key !== "priority" && key !== "tags") {
        validateField(key, formData[key as keyof TaskFormData] as string);
        if (validationErrors[key]) {
          errors[key] = validationErrors[key];
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setError("Please fix the validation errors before submitting.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      if (isEditing) {
        await tasksAPI.updateTask(id!, submitData);
      } else {
        await tasksAPI.createTask(submitData);
      }

      navigate("/tasks");
    } catch (err: unknown) {
      const error = err as Error;
      setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <h1>{isEditing ? "Edit Task" : "Create New Task"}</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {validationErrors.title && fieldTouched.title && <div className="field-error">{validationErrors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            required
          />
          {validationErrors.description && fieldTouched.description && <div className="field-error">{validationErrors.description}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {validationErrors.dueDate && fieldTouched.dueDate && <div className="field-error">{validationErrors.dueDate}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assigned To *</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            >
              <option value="">Select User</option>
              {users?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
            {validationErrors.assignedTo && fieldTouched.assignedTo && <div className="field-error">{validationErrors.assignedTo}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <div className="tags-input">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary"
            >
              Add Tag
            </button>
          </div>
          <div className="tags-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
