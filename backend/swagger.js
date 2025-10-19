import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "API documentation for Task Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Task: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Task ID",
            },
            title: {
              type: "string",
              description: "Task title",
            },
            description: {
              type: "string",
              description: "Task description",
            },
            status: {
              type: "string",
              enum: ["todo", "in-progress", "review", "done"],
              description: "Task status",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              description: "Task priority",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
            },
            assignedTo: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                },
                username: {
                  type: "string",
                },
              },
              description: "User assigned to the task",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Task tags",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Task creation date",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Task last update date",
            },
          },
        },
        TaskInput: {
          type: "object",
          required: ["title", "description", "dueDate", "assignedTo"],
          properties: {
            title: {
              type: "string",
              description: "Task title",
            },
            description: {
              type: "string",
              description: "Task description",
            },
            status: {
              type: "string",
              enum: ["todo", "in-progress", "review", "done"],
              default: "todo",
              description: "Task status",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              default: "medium",
              description: "Task priority",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
            },
            assignedTo: {
              type: "string",
              description: "ID of the user assigned to the task",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Task tags",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Comment ID",
            },
            content: {
              type: "string",
              description: "Comment content",
            },
            taskId: {
              type: "string",
              description: "ID of the task this comment belongs to",
            },
            author: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                },
                username: {
                  type: "string",
                },
              },
              description: "Comment author",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Comment creation date",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Comment last update date",
            },
          },
        },
        File: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "File ID",
            },
            filename: {
              type: "string",
              description: "Original filename",
            },
            originalName: {
              type: "string",
              description: "Original file name",
            },
            mimetype: {
              type: "string",
              description: "File MIME type",
            },
            size: {
              type: "integer",
              description: "File size in bytes",
            },
            taskId: {
              type: "string",
              description: "ID of the task this file belongs to",
            },
            uploadedBy: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                },
                username: {
                  type: "string",
                },
              },
              description: "User who uploaded the file",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "File upload date",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
