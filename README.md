# Task Management System

A full-stack task management application built with React (frontend) and Express.js + MongoDB (backend). Features user authentication, task CRUD operations, file attachments, comments, and analytics.

**Version:** 1.0.0

## Features

### Backend (Express.js + MongoDB)

- **Authentication**: User registration, login, JWT-based auth
- **Task Management**: Create, read, update, delete tasks with filtering, searching, sorting, pagination
- **Comments**: Add, edit, delete comments on tasks
- **File Uploads**: Multiple file attachments per task with validation
- **Analytics**: Task statistics, user performance metrics, trends, data export
- **Security**: CORS, rate limiting, input validation, sanitization

### Frontend (React + TypeScript)

- **Responsive UI**: Mobile-friendly design with custom CSS
- **Authentication**: Login/register forms with validation
- **Dashboard**: Overview statistics and quick actions
- **Task Management**: List view with filters, detail view, create/edit forms
- **File Management**: Drag-and-drop file uploads
- **Comments**: Real-time comment system
- **Analytics**: Charts and performance metrics
- **State Management**: React Context for global state

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Joi for validation
- bcryptjs for password hashing

### Frontend

- React 19 with TypeScript
- React Router for routing
- Axios for API calls
- Chart.js for data visualization
- Custom CSS (no frameworks)

## Getting Started

### Prerequisites

- Node.js (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- MongoDB (local installation or MongoDB Atlas cloud service)
  - For local: Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
  - For Atlas: Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com/)
- npm or yarn (comes with Node.js)

### How to Run the Application

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Set up MongoDB**
   - If using local MongoDB, ensure it's running on default port 27017
   - If using MongoDB Atlas, get your connection string from the Atlas dashboard

3. **Backend Setup**

   ```bash
   cd backend
   npm install
   # Create .env file (see Environment Variables section below)
   npm start
   ```

   The backend will start on `http://localhost:3000`

4. **Frontend Setup** (in a new terminal)

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Register a new account or login with existing credentials

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/taskmanagement  # or your Atlas connection string
JWT_SECRET=your_super_secret_jwt_key_here          # Generate a strong random string
JWT_EXPIRE=7d
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760                              # 10MB in bytes
FRONTEND_URL=http://localhost:5173
```

## API Documentation

The API is fully documented using Swagger/OpenAPI. When the backend server is running, you can access the interactive API documentation at:

**http://localhost:3000/api-docs**

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/taskmanagement  # or your Atlas connection string
JWT_SECRET=your_super_secret_jwt_key_here          # Generate a strong random string
JWT_EXPIRE=7d
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760                              # 10MB in bytes
FRONTEND_URL=http://localhost:5173
```

## Demo Video

[Demo Video Placeholder - Add link to demo video here]

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Task Endpoints

- `GET /api/tasks` - Get all tasks (with query params for filtering)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (soft delete)
- `POST /api/tasks/bulk` - Bulk create tasks

### Comment Endpoints

- `GET /api/comments/:taskId` - Get comments for a task
- `POST /api/comments/:taskId` - Add comment to task
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### File Endpoints

- `POST /api/files/:taskId` - Upload files to task
- `GET /api/files/task/:taskId` - Get files for a task
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### Analytics Endpoints

- `GET /api/analytics/overview` - Task overview statistics
- `GET /api/analytics/performance` - User performance metrics
- `GET /api/analytics/trends` - Task trends over time
- `GET /api/analytics/export` - Export tasks data (CSV/JSON)

## Database Schema

### User

```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  avatar: String,
  isActive: Boolean (default: true)
}
```

### Task

```javascript
{
  title: String (required),
  description: String,
  status: String (enum: ['todo', 'in-progress', 'review', 'done']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  dueDate: Date,
  tags: [String],
  assignedTo: ObjectId (ref: 'User'),
  createdBy: ObjectId (ref: 'User'),
  isDeleted: Boolean (default: false)
}
```

### Comment

```javascript
{
  content: String (required),
  task: ObjectId (ref: 'Task', required),
  author: ObjectId (ref: 'User', required)
}
```

### File

```javascript
{
  filename: String (required),
  originalName: String (required),
  mimetype: String (required),
  size: Number (required),
  path: String (required),
  task: ObjectId (ref: 'Task', required),
  uploadedBy: ObjectId (ref: 'User', required)
}
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View task statistics and quick actions
3. **Tasks**: Browse, filter, and manage tasks
4. **Task Details**: View full task info, add comments, upload files
5. **Analytics**: Monitor performance and export data

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Assumptions Made

- Users can only edit/delete their own tasks and comments
- File uploads are limited to 10MB per file
- Tasks support soft deletion (marked as deleted, not removed)
- JWT tokens expire after 7 days
- MongoDB is the primary database (could be extended to support others)
- Frontend assumes backend is running on port 3000
- No email notifications implemented (could be added as enhancement)
- Basic role-based access (user/admin) with admin having extra permissions

## Recent Updates

### v1.1.0 - Enum Standardization and Analytics Fixes

- **Standardized Enums**: Updated frontend to match backend task enums
  - Status: `todo`, `in-progress`, `review`, `done`
  - Priority: `low`, `medium`, `high`, `urgent`
- **Analytics API Fixes**:
  - Fixed `getOverview` to return proper object format with `totalTasks`, `completedTasks`, etc.
  - Fixed `getPerformance` to return array of all users' performance metrics
- **UI Improvements**:
  - Added navigation links to Dashboard quick action buttons
  - Added bulk create tasks component for creating multiple tasks at once
  - Added CSS styles for new status and priority badges

## Future Enhancements

- Email notifications for task assignments/deadlines
- Real-time updates with WebSockets
- Advanced filtering and search
- Task templates
- Time tracking
- Integration with calendar apps
- Mobile app version
- Multi-language support
