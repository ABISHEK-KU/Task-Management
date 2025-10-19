import React, { useState } from 'react';
import { commentsAPI } from '../services/api';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  taskId: string;
  comments: Comment[];
  onCommentUpdate: () => void;
  currentUserId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  taskId,
  comments,
  onCommentUpdate,
  currentUserId
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');

    try {
      await commentsAPI.addComment(taskId, { content: newComment });
      setNewComment('');
      onCommentUpdate();
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    setError('');

    try {
      await commentsAPI.updateComment(commentId, { content: editContent });
      setEditingComment(null);
      setEditContent('');
      onCommentUpdate();
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    setError('');

    try {
      await commentsAPI.deleteComment(commentId);
      onCommentUpdate();
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newComment.trim()} className="btn-primary">
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-header">
                <strong>{comment.author.username}</strong>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                {comment.author._id === currentUserId && (
                  <div className="comment-actions">
                    {editingComment === comment._id ? (
                      <>
                        <button onClick={() => handleEditComment(comment._id)} disabled={loading}>
                          Save
                        </button>
                        <button onClick={cancelEditing} disabled={loading}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(comment)} disabled={loading}>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          disabled={loading}
                          className="btn-danger"
                        >
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
                  disabled={loading}
                />
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
