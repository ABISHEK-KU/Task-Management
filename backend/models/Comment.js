import {model,Schema} from 'mongoose';

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ task: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ isDeleted: 1 });

export default model('Comment', commentSchema);
