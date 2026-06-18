# Project Structure

```
professional-reputation-platform/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   └── layout/
│   │   │       ├── Layout.jsx      # Main layout wrapper
│   │   │       ├── Header.jsx      # Top navigation bar
│   │   │       └── Sidebar.jsx     # Side navigation
│   │   ├── pages/                  # Page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx       # Login page
│   │   │   │   └── Register.jsx    # Registration page
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Profile.jsx         # User profile page
│   │   │   ├── Timeline.jsx        # Timeline events page
│   │   │   ├── Connections.jsx     # Connections management
│   │   │   ├── Search.jsx          # Search page
│   │   │   ├── Projects.jsx        # Projects listing
│   │   │   ├── ProjectDetail.jsx   # Project details
│   │   │   ├── Organizations.jsx   # Organizations listing
│   │   │   ├── OrganizationDetail.jsx # Org details
│   │   │   ├── Settings.jsx        # User settings
│   │   │   ├── Notifications.jsx   # Notifications
│   │   │   └── NotFound.jsx        # 404 page
│   │   ├── services/               # API and external services
│   │   │   ├── api.js              # Axios instance & interceptors
│   │   │   └── socket.js           # Socket.io client setup
│   │   ├── store/                  # State management (Zustand)
│   │   │   └── authStore.js        # Authentication state
│   │   ├── utils/                  # Utility functions
│   │   ├── App.jsx                 # Main App component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles (Tailwind)
│   ├── public/                     # Static assets
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── package.json                # Client dependencies
│   ├── .env.example                # Environment variables template
│   └── .gitignore                  # Git ignore rules
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── User.js             # User model
│   │   │   ├── Organization.js     # Organization model
│   │   │   ├── Event.js            # Timeline event model
│   │   │   ├── Project.js          # Project model
│   │   │   ├── Connection.js       # Connection model
│   │   │   ├── Watch.js            # Watch/Follow model
│   │   │   ├── Star.js             # Star/Endorsement model
│   │   │   ├── Comment.js          # Comment model
│   │   │   └── Notification.js     # Notification model
│   │   ├── controllers/            # Route handlers
│   │   │   ├── authController.js   # Authentication logic
│   │   │   └── connectionController.js # Connection logic
│   │   ├── routes/                 # API routes
│   │   │   ├── auth.js             # Auth routes
│   │   │   ├── users.js            # User routes
│   │   │   ├── connections.js      # Connection routes
│   │   │   ├── events.js           # Event routes
│   │   │   ├── stars.js            # Star routes
│   │   │   ├── comments.js         # Comment routes
│   │   │   ├── projects.js         # Project routes
│   │   │   ├── organizations.js    # Organization routes
│   │   │   ├── notifications.js    # Notification routes
│   │   │   └── search.js           # Search routes
│   │   ├── middleware/             # Custom middleware
│   │   │   ├── auth.js             # Authentication middleware
│   │   │   ├── errorHandler.js     # Error handling
│   │   │   ├── notFound.js         # 404 handler
│   │   │   ├── rateLimiter.js      # Rate limiting
│   │   │   └── checkConnection.js  # Connection verification
│   │   ├── socket/                 # Socket.io setup
│   │   │   └── index.js            # Socket initialization
│   │   ├── utils/                  # Utility functions
│   │   ├── config/                 # Configuration files
│   │   └── server.js               # Express app entry point
│   ├── package.json                # Server dependencies
│   ├── .env.example                # Environment variables template
│   └── .gitignore                  # Git ignore rules
│
├── package.json                     # Root workspace configuration
├── README.md                        # Project overview & documentation
├── GETTING_STARTED.md              # Setup and installation guide
└── .gitignore                      # Global git ignore rules
```

## Key Files Explained

### Backend (Server)

#### Models (`/server/src/models/`)
- **User.js**: User accounts with authentication, profile info, privacy settings
- **Organization.js**: Company/organization profiles with admins and employees
- **Event.js**: Timeline events (skills, projects, endorsements, certifications)
- **Project.js**: Project details with team members and organization links
- **Connection.js**: User connections with request/accept/reject workflow
- **Watch.js**: Follow/watch functionality for users and organizations
- **Star.js**: Endorsements with weighted scoring based on relationships
- **Comment.js**: Comments on events with moderation support
- **Notification.js**: Real-time notifications for user actions

#### Routes (`/server/src/routes/`)
All routes follow RESTful conventions:
- **auth.js**: `/api/auth/*` - Registration, login, password management
- **users.js**: `/api/users/*` - User profiles and search
- **connections.js**: `/api/connections/*` - Connection management and watching
- **events.js**: `/api/events/*` - Timeline event CRUD and approvals
- **stars.js**: `/api/stars/*` - Endorsement system
- **comments.js**: `/api/comments/*` - Comment system with moderation
- **projects.js**: `/api/projects/*` - Project management
- **organizations.js**: `/api/organizations/*` - Organization profiles
- **notifications.js**: `/api/notifications/*` - Notification management
- **search.js**: `/api/search/*` - Universal search functionality

#### Middleware (`/server/src/middleware/`)
- **auth.js**: JWT verification, role-based access control
- **errorHandler.js**: Centralized error handling
- **rateLimiter.js**: API rate limiting for different endpoints
- **checkConnection.js**: Verify connections between users

### Frontend (Client)

#### Pages (`/client/src/pages/`)
- **Home.jsx**: Public landing page with feature highlights
- **auth/Login.jsx**: User login form
- **auth/Register.jsx**: New user registration
- **Profile.jsx**: User profile display and editing
- **Timeline.jsx**: Chronological timeline of user events
- **Connections.jsx**: Connection management dashboard
- **Search.jsx**: Universal search interface
- **Projects.jsx**: Project listing and management
- **Organizations.jsx**: Organization directory
- **Settings.jsx**: User preferences and privacy controls
- **Notifications.jsx**: Notification center

#### Components (`/client/src/components/`)
- **layout/Layout.jsx**: Main layout wrapper with header and sidebar
- **layout/Header.jsx**: Top navigation with user menu
- **layout/Sidebar.jsx**: Side navigation menu

#### Services (`/client/src/services/`)
- **api.js**: Axios instance with auth interceptors
- **socket.js**: Socket.io client for real-time features

#### Store (`/client/src/store/`)
- **authStore.js**: Zustand store for authentication state

## Data Flow

### Authentication Flow
1. User registers/logs in via `/api/auth/login` or `/api/auth/register`
2. Server validates credentials and returns JWT token
3. Client stores token in localStorage and Zustand store
4. All subsequent requests include token in Authorization header
5. Server middleware verifies token and attaches user to request

### Connection Request Flow
1. User A sends connection request to User B
2. Notification created for User B
3. User B can accept or reject (with reason)
4. If accepted, both users' connection counts increment
5. Real-time notification sent via Socket.io

### Event Creation & Approval Flow
1. User creates event on their timeline (auto-approved)
2. OR another user submits event to User A's timeline (pending)
3. User A receives notification
4. User A can approve or reject (with reason)
5. If approved, event appears on timeline
6. If rejected, submitter receives notification with reason

### Star/Endorsement Flow
1. User stars an event
2. System calculates weight:
   - Same organization: 2x weight
   - Direct connection: 1.5x weight
   - Public: 1x weight
3. Event's weighted score updates
4. Star visibility respects event owner's privacy settings

## Environment Variables

### Server (.env)
```env
PORT                    # Server port (default: 5000)
NODE_ENV               # Environment (development/production)
MONGODB_URI            # MongoDB connection string
JWT_SECRET             # Secret key for JWT tokens
JWT_EXPIRE             # Token expiration time
CLOUDINARY_*           # Image upload service credentials
EMAIL_*                # Email service configuration
CLIENT_URL             # Frontend URL for CORS
```

### Client (.env)
```env
VITE_API_URL           # Backend API base URL
VITE_SOCKET_URL        # Socket.io server URL
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/privacy-settings` - Update privacy

### Connections
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/:id/accept` - Accept request
- `PUT /api/connections/:id/reject` - Reject request
- `GET /api/connections/my-connections` - Get connections
- `POST /api/connections/watch/user/:userId` - Watch user
- `POST /api/connections/watch/organization/:orgId` - Watch org

### Events (Timeline)
- `POST /api/events` - Create event
- `GET /api/events/user/:userId` - Get user's timeline
- `PUT /api/events/:id/approve` - Approve event
- `PUT /api/events/:id/reject` - Reject event
- `DELETE /api/events/:id` - Delete event

### Stars & Comments
- `POST /api/stars/:eventId` - Star an event
- `GET /api/stars/:eventId` - Get event stars
- `POST /api/comments/:eventId` - Add comment
- `PUT /api/comments/:id/moderate` - Moderate comment

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Socket.io** - Real-time communication
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: Bcrypt for secure password storage
3. **Rate Limiting**: Prevent abuse of API endpoints
4. **CORS**: Controlled cross-origin access
5. **Helmet**: Security headers
6. **Input Validation**: Express Validator for request validation
7. **Privacy Controls**: Granular per-event and profile privacy
8. **Connection Verification**: Middleware to check user relationships

## Real-time Features

- Live notifications via Socket.io
- Instant connection status updates
- Real-time comment moderation
- Live star count updates

---

This structure provides a solid foundation for building a professional reputation platform with scalability and maintainability in mind.
