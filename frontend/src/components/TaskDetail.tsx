import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tasksAPI, commentsAPI, filesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface File {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadedBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState<string | null>(null);
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState<string | null>(null);

  const fetchTask = async () => {
    try {
      const response = await tasksAPI.getTask(id!);
      setTask(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load task');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments(id!);
      setComments(response.data);
    } catch (err: unknown) {
      console.error('Failed to load comments:', err);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await filesAPI.getFiles(id!);
      setFiles(response.data);
    } catch (err: unknown) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchComments();
      fetchFiles();
    }
  }, [id]);

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      await tasksAPI.updateTask(id!, { status: newStatus });
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await tasksAPI.deleteTask(id!);
      navigate('/tasks');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsAPI.addComment(id!, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await commentsAPI.updateComment(commentId, { content: editContent });
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setShowDeleteCommentDialog(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!showDeleteCommentDialog) return;
    try {
      await commentsAPI.deleteComment(showDeleteCommentDialog);
      fetchComments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setShowDeleteCommentDialog(null);
    }
  };

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await filesAPI.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to download file');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setShowDeleteFileDialog(fileId);
  };

  const confirmDeleteFile = async () => {
    if (!showDeleteFileDialog) return;
    try {
      await filesAPI.deleteFile(showDeleteFileDialog);
      fetchFiles();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete file');
    } finally {
      setShowDeleteFileDialog(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return <div className="error-message">{error || 'Task not found'}</div>;
  }

  const canEdit = user?._id === task.createdBy._id || user?.role === 'admin';
  const canComment = user !== null;

  return (
    <div className="task-detail">
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
      <ConfirmationDialog
        isOpen={!!showDeleteCommentDialog}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={confirmDeleteComment}
        onCancel={() => setShowDeleteCommentDialog(null)}
      />
      <ConfirmationDialog
        isOpen={!!showDeleteFileDialog}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        onConfirm={confirmDeleteFile}
        onCancel={() => setShowDeleteFileDialog(null)}
      />
      <div className="task-detail-header">
        <Link to="/tasks" className="back-link">← Back to Tasks</Link>
        {canEdit && (
          <div className="task-actions">
            <Link to={`/tasks/${id}/edit`} className="btn-secondary">Edit</Link>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </div>
        )}
      </div>

      <div className="task-content">
        <h1>{task.title}</h1>
        <div className="task-meta">
          <span className={`status-badge status-${task.status}`}>
            {task.status}
          </span>
          <span className={`priority-badge priority-${task.priority}`}>
            {task.priority} priority
          </span>
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          <span>Assigned to: {task.assignedTo.username}</span>
          <span>Created by: {task.createdBy.username}</span>
        </div>

        <div className="task-description">
          <h3>Description</h3>
          <p>{task.description}</p>
        </div>

        {task.tags.length > 0 && (
          <div className="task-tags">
            <h3>Tags</h3>
            <div className="tags-list">
              {task.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {canEdit && (
          <div className="status-update">
            <h3>Update Status</h3>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}

        <div className="task-files">
          <h3>Files ({files.length})</h3>
          {files.length === 0 ? (
            <div className="empty-state empty-state-files">
              <div className="empty-state-icon">📎</div>
              <h4>No files attached</h4>
              <p>Files can be uploaded to provide additional context or deliverables for this task.</p>
            </div>
          ) : (
            <ul className="files-list">
              {files.map((file) => (
                <li key={file._id} className="file-item">
                  <span>{file.originalName}</span>
                  <span>({Math.round(file.size / 1024)} KB)</span>
                  <span>Uploaded by {file.uploadedBy.username}</span>
                  <button onClick={() => handleDownloadFile(file._id, file.originalName)}>
                    Download
                  </button>
                  {(user?._id === file.uploadedBy._id || canEdit) && (
                    <button onClick={() => handleDeleteFile(file._id)} className="btn-danger">
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="task-comments">
          <h3>Comments ({comments.length})</h3>
          {canComment && (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                required
              />
              <button type="submit" className="btn-primary">Add Comment</button>
            </form>
          )}

          {comments.length === 0 ? (
            <div className="empty-state empty-state-comments">
              <div className="empty-state-icon">💬</div>
              <h4>No comments yet</h4>
              <p>Start a conversation by adding the first comment to this task.</p>
            </div>
          ) : (
            <ul className="comments-list">
              {comments.map((comment) => (
                <li key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <strong>{comment.author.username}</strong>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    {user?._id === comment.author._id && (
                      <div className="comment-actions">
                        {editingComment === comment._id ? (
                          <>
                            <button onClick={() => handleEditComment(comment._id)}>Save</button>
                            <button onClick={() => setEditingComment(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => {
                              setEditingComment(comment._id);
                              setEditContent(comment.content);
                            }}>Edit</button>
                            <button onClick={() => handleDeleteComment(comment._id)} className="btn-danger">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingComment === comment._id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                  ) : (
                    <p>{comment.content}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
