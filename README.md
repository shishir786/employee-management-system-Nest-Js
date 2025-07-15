# Employee Management System

A full-featured employee management backend built with [NestJS](https://nestjs.com/). This system provides robust APIs for managing employees, attendance, leave requests, notices, projects, timesheets, and user authentication/authorization.

---

## Features

- **User Management:** Register, update, and manage users with roles.
- **Authentication & Authorization:** Secure JWT-based login, role-based access control.
- **Leave Management:** Request, approve, and track employee leaves (with types and statuses).
- **Notice Board:** Post and manage company-wide notices.
- **Project Management:** Create projects, assign employees, track project status and duration.
- **Timesheets:** Log daily work hours and descriptions for employees.
- **API Documentation:** Auto-generated, always up-to-date API docs ([api-docs.md](./api-docs.md)).

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
# Development
npm run start

# Watch mode
npm run start:dev

# Production
npm run start:prod
```

### Environment Variables

Create a `.env` file in the root with your configuration (DB connection, JWT secret, etc).

---

## API Documentation

- The full API documentation is available in [api-docs.md](./api-docs.md), generated automatically from the OpenAPI spec using Widdershins.
- You can also view interactive Swagger UI at `/api` when the server is running.

---

## Project Structure

```
src/
  ├── attendance/   # Attendance tracking
  ├── auth/         # Authentication & authorization
  ├── leave/        # Leave management
  ├── notice/       # Notice board
  ├── projects/     # Project management
  ├── timesheets/   # Timesheet logging
  ├── users/        # User management
  └── utility/      # Shared utilities, decorators, guards
```

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

---

## License

This project is [MIT licensed](LICENSE).
